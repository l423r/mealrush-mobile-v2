import { makeAutoObservable, runInAction, computed } from 'mobx';
import type RootStore from './RootStore';
import type {
  DietChatMessage,
  DietChatSession,
} from '../types/api.types';
import { dietChatService } from '../api/services/dietChat.service';

interface LoadingStates {
  sessions: boolean;
  messages: boolean;
  creating: boolean;
}

interface StreamingState {
  isStreaming: boolean;
  sessionId: number | null;
  partialAssistant: string;
  error: string | null;
}

class DietChatStore {
  rootStore: RootStore;

  sessions: DietChatSession[] = [];
  currentSessionId: number | null = null;
  messagesBySession: Map<number, DietChatMessage[]> = new Map();
  loading: LoadingStates = {
    sessions: false,
    messages: false,
    creating: false,
  };
  streaming: StreamingState = {
    isStreaming: false,
    sessionId: null,
    partialAssistant: '',
    error: null,
  };
  private streamController: { cancel: () => void } | null = null;
  private pendingAssistantMessageId: number | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      currentSession: computed,
      currentMessages: computed,
    });
  }

  get currentSession(): DietChatSession | null {
    return (
      this.sessions.find((session) => session.id === this.currentSessionId) ??
      null
    );
  }

  get currentMessages(): DietChatMessage[] {
    if (!this.currentSessionId) return [];
    return this.messagesBySession.get(this.currentSessionId) ?? [];
  }

  setCurrentSession(sessionId: number | null) {
    this.currentSessionId = sessionId;
    if (sessionId && !this.messagesBySession.has(sessionId)) {
      this.loadMessages(sessionId);
    }
  }

  private upsertMessages(sessionId: number, messages: DietChatMessage[]) {
    this.messagesBySession.set(sessionId, messages);
  }

  private addMessage(sessionId: number, message: DietChatMessage) {
    const existing = this.messagesBySession.get(sessionId) ?? [];
    this.messagesBySession.set(sessionId, [...existing, message]);
  }

  private updateAssistantMessageContent(
    sessionId: number,
    messageId: number,
    content: string
  ) {
    const existing = this.messagesBySession.get(sessionId);
    if (!existing) return;
    const updated = existing.map((msg) =>
      msg.id === messageId ? { ...msg, content } : msg
    );
    this.messagesBySession.set(sessionId, updated);
  }

  async loadSessions() {
    this.loading.sessions = true;
    try {
      const response = await dietChatService.getSessions();
      runInAction(() => {
        this.sessions = response.data;
        this.loading.sessions = false;
        if (!this.currentSessionId && this.sessions.length > 0) {
          this.currentSessionId = this.sessions[0].id;
        }
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading.sessions = false;
        this.streaming.error =
          error.response?.data?.message ||
          error.message ||
          'Ошибка загрузки чатов';
      });
      throw error;
    }
  }

  async createSession(title?: string) {
    this.loading.creating = true;
    try {
      const response = await dietChatService.createSession({ title });
      runInAction(() => {
        this.sessions = [response.data, ...this.sessions];
        this.currentSessionId = response.data.id;
        this.loading.creating = false;
      });
      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading.creating = false;
        this.streaming.error =
          error.response?.data?.message ||
          error.message ||
          'Не удалось создать чат';
      });
      throw error;
    }
  }

  async loadMessages(sessionId: number, limit: number = 20) {
    this.loading.messages = true;
    try {
      const response = await dietChatService.getMessages(sessionId, limit);
      runInAction(() => {
        this.upsertMessages(sessionId, response.data);
        this.loading.messages = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading.messages = false;
        this.streaming.error =
          error.response?.data?.message ||
          error.message ||
          'Ошибка загрузки сообщений';
      });
      throw error;
    }
  }

  async sendMessage(sessionId: number, text: string) {
    if (this.streaming.isStreaming) {
      return;
    }

    const now = Date.now();
    const userMessage: DietChatMessage = {
      id: now,
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantMessageId = now + 1;
    const assistantMessage: DietChatMessage = {
      id: assistantMessageId,
      role: 'ASSISTANT',
      content: '',
      createdAt: new Date().toISOString(),
    };

    this.addMessage(sessionId, userMessage);
    this.addMessage(sessionId, assistantMessage);

    this.streaming = {
      isStreaming: true,
      sessionId,
      partialAssistant: '',
      error: null,
    };
    this.pendingAssistantMessageId = assistantMessageId;

    try {
      this.streamController = await dietChatService.streamMessage(
        sessionId,
        { message: text },
        {
          onToken: (token) => {
            runInAction(() => {
              this.streaming.partialAssistant += token;
              if (this.pendingAssistantMessageId) {
                this.updateAssistantMessageContent(
                  sessionId,
                  this.pendingAssistantMessageId,
                  this.streaming.partialAssistant
                );
              }
            });
          },
          onDone: () => {
            runInAction(() => {
              this.streaming.isStreaming = false;
              this.streamController = null;
              this.pendingAssistantMessageId = null;
            });
            this.loadMessages(sessionId);
          },
          onError: (error) => {
            runInAction(() => {
              this.streaming.error = error.message;
              this.streaming.isStreaming = false;
              this.streamController = null;
            });
            this.loadMessages(sessionId);
          },
        }
      );
    } catch (error: any) {
      runInAction(() => {
        this.streaming.error =
          error.response?.data?.message || error.message || 'Ошибка отправки';
        this.streaming.isStreaming = false;
        this.streamController = null;
        this.pendingAssistantMessageId = null;
      });
      this.loadMessages(sessionId);
      throw error;
    }
  }

  cancelStream() {
    if (this.streamController) {
      this.streamController.cancel();
    }
    this.streaming.isStreaming = false;
    this.streamController = null;
    if (this.streaming.sessionId) {
      this.loadMessages(this.streaming.sessionId);
    }
    this.pendingAssistantMessageId = null;
  }

  reset() {
    this.sessions = [];
    this.currentSessionId = null;
    this.messagesBySession.clear();
    this.loading = {
      sessions: false,
      messages: false,
      creating: false,
    };
    this.streaming = {
      isStreaming: false,
      sessionId: null,
      partialAssistant: '',
      error: null,
    };
    this.streamController = null;
    this.pendingAssistantMessageId = null;
  }
}

export default DietChatStore;

