import { API_BASE_URL, ApiRoutes } from '../apiRoutes';
import { apiClient, getToken } from '../axios.config';
import type {
  CreateDietChatSessionRequest,
  DietChatMessagesResponse,
  DietChatSession,
  SendDietChatMessageRequest,
} from '../../types/api.types';

export interface DietChatStreamHandlers {
  onToken?: (token: string) => void;
  onDone?: (result?: string) => void;
  onError?: (error: Error) => void;
}

export interface DietChatStreamController {
  cancel: () => void;
}

const parseSseEvent = (
  chunk: string
): { event: string | null; data: string } => {
  const lines = chunk.split(/\r?\n/);
  let eventName: string | null = null;
  const dataLines: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(':')) return; // comment/heartbeat
    if (trimmed.startsWith('event:')) {
      eventName = trimmed.slice('event:'.length).trim();
    } else if (trimmed.startsWith('data:')) {
      dataLines.push(trimmed.slice('data:'.length).trim());
    }
  });

  return {
    event: eventName,
    data: dataLines.join('\n'),
  };
};

const normalizeEvent = (parsed: { event: string | null; data: string }) => {
  // Если есть явный тип события, используем его
  if (parsed.event) {
    // Если событие 'done' или данные содержат 'completed', это завершение
    if (parsed.event === 'done' || parsed.data === 'completed') {
      return { event: 'done', data: parsed.data };
    }
    // Иначе используем указанный тип события
    return parsed;
  }
  
  // Fallback: если сервер не прислал event, трактуем по данным
  if (parsed.data) {
    if (parsed.data === 'completed' || parsed.data.trim() === 'completed') {
      return { event: 'done', data: parsed.data };
    }
    // Если данных нет или они пустые, игнорируем
    if (parsed.data.trim()) {
      return { event: 'token', data: parsed.data };
    }
  }
  
  return parsed;
};

export const dietChatService = {
  getSessions: () =>
    apiClient.get<DietChatSession[]>(ApiRoutes.DietChat.Sessions),

  createSession: (payload: CreateDietChatSessionRequest) =>
    apiClient.post<DietChatSession>(ApiRoutes.DietChat.Sessions, payload),

  getMessages: (sessionId: number, limit: number = 20) =>
    apiClient.get<DietChatMessagesResponse>(
      `${ApiRoutes.DietChat.Sessions}/${sessionId}/messages`,
      { params: { limit } }
    ),

  streamMessage: async (
    sessionId: number,
    payload: SendDietChatMessageRequest,
    handlers: DietChatStreamHandlers
  ): Promise<DietChatStreamController> => {
    let xhr: XMLHttpRequest | null = null;
    let isCancelled = false;
    let lastIndexProcessed = 0;

    try {
      const token = await getToken();
      const payloadWithLang = payload as SendDietChatMessageRequest & {
        language?: string;
      };
      const query = new URLSearchParams({
        message: payloadWithLang.message,
        ...(payloadWithLang.language ? { language: payloadWithLang.language } : {}),
      }).toString();

      const url = `${API_BASE_URL}${ApiRoutes.DietChat.Sessions}/${sessionId}/stream?${query}`;

      if (__DEV__) {
        console.log('[dietChatService] streamMessage: request', {
          url,
          hasToken: !!token,
          payloadLength: JSON.stringify(payload).length,
        });
      }

      xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);

      // Устанавливаем заголовки
      xhr.setRequestHeader('Accept', 'text/event-stream');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      // Обработка прогресса (для streaming)
      xhr.onreadystatechange = () => {
        if (isCancelled || !xhr) return;

        const currentXhr = xhr; // Сохраняем ссылку на случай, если xhr будет установлен в null
        const readyState = currentXhr.readyState;

        if (readyState === XMLHttpRequest.LOADING || readyState === XMLHttpRequest.DONE) {
          try {
            const responseText = currentXhr.responseText || '';
            const newData = responseText.substring(lastIndexProcessed);

            if (newData && __DEV__) {
              console.log('[dietChatService] streamMessage: received data', {
                newDataLength: newData.length,
                totalLength: responseText.length,
              });
            }

            // Парсим SSE события
            // Используем буфер для накопления неполных событий
            const fullText = responseText;
            const events = fullText.substring(lastIndexProcessed).split(/\r?\n\r?\n/);
            
            // Последний элемент может быть неполным событием, сохраняем его для следующей итерации
            const completeEvents = events.slice(0, -1);
            const lastEvent = events[events.length - 1];
            
            // Обновляем lastIndexProcessed только для полностью обработанных событий
            if (completeEvents.length > 0) {
              const processedLength = fullText.substring(lastIndexProcessed, fullText.length - lastEvent.length).length;
              lastIndexProcessed = responseText.length - lastEvent.length;
            }

            completeEvents.forEach((rawEvent) => {
              if (!rawEvent.trim()) return;

              if (__DEV__) {
                console.log('[dietChatService] streamMessage: raw event', {
                  rawEvent: rawEvent.substring(0, 200), // Первые 200 символов для отладки
                  rawEventLength: rawEvent.length,
                });
              }

              const parsed = parseSseEvent(rawEvent);
              const { event, data } = normalizeEvent(parsed);

              if (__DEV__) {
                console.log('[dietChatService] streamMessage: parsed event', {
                  event,
                  dataLength: data?.length || 0,
                  dataPreview: data?.substring(0, 50) || '',
                });
              }

              if (event === 'token' && data) {
                if (__DEV__) {
                  console.log('[dietChatService] streamMessage: token event', {
                    dataLength: data.length,
                  });
                }
                handlers.onToken?.(data);
              } else if (event === 'done') {
                if (__DEV__) {
                  console.log('[dietChatService] streamMessage: done event');
                }
                handlers.onDone?.(data);
                // Закрываем соединение после обработки done
                if (xhr) {
                  xhr.abort();
                  xhr = null;
                }
                return; // Прерываем обработку после done
              } else if (__DEV__) {
                console.log('[dietChatService] streamMessage: unknown event type', {
                  event,
                  hasData: !!data,
                });
              }
            });
          } catch (error) {
            if (__DEV__) {
              console.log('[dietChatService] streamMessage: parse error', error);
            }
          }
        }

        // Проверяем завершение запроса только если xhr еще существует
        if (xhr && readyState === XMLHttpRequest.DONE) {
          if (currentXhr.status === 200) {
            // Обрабатываем оставшиеся данные
            try {
              const responseText = currentXhr.responseText || '';
              const remainingData = responseText.substring(lastIndexProcessed);
              if (remainingData.trim()) {
                const { event, data } = normalizeEvent(parseSseEvent(remainingData));
                if (event === 'token' && data) {
                  handlers.onToken?.(data);
                } else if (event === 'done') {
                  handlers.onDone?.(data);
                }
              }
            } catch (error) {
              if (__DEV__) {
                console.log('[dietChatService] streamMessage: final parse error', error);
              }
            }
          } else if (currentXhr.status !== 0) {
            // Ошибка HTTP
            const errorMessage = `Ошибка запроса: ${currentXhr.status} ${currentXhr.statusText}`;
            if (__DEV__) {
              console.log('[dietChatService] streamMessage: HTTP error', {
                status: currentXhr.status,
                statusText: currentXhr.statusText,
              });
            }
            handlers.onError?.(new Error(errorMessage));
          }
        }
      };

      // Обработка ошибок сети
      xhr.onerror = () => {
        if (isCancelled || !xhr) return;
        const errorMessage = 'Ошибка сетевого соединения';
        if (__DEV__) {
          console.log('[dietChatService] streamMessage: network error');
        }
        handlers.onError?.(new Error(errorMessage));
      };

      // Обработка таймаута
      xhr.ontimeout = () => {
        if (isCancelled || !xhr) return;
        const errorMessage = 'Таймаут запроса';
        if (__DEV__) {
          console.log('[dietChatService] streamMessage: timeout');
        }
        handlers.onError?.(new Error(errorMessage));
      };

      // Устанавливаем таймаут (60 секунд)
      xhr.timeout = 60000;

      // Отправляем запрос
      xhr.send();

      if (__DEV__) {
        console.log('[dietChatService] streamMessage: request sent');
      }
    } catch (error) {
      if (!isCancelled) {
        console.log('[dietChatService] streamMessage: error', error);
        handlers.onError?.(error as Error);
      }
    }

    return {
      cancel: () => {
        isCancelled = true;
        if (xhr) {
          if (__DEV__) {
            console.log('[dietChatService] streamMessage: cancelling');
          }
          xhr.abort();
          xhr = null;
        }
      },
    };
  },
};


