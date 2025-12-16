# Скрипты для получения скриншотов с Android устройства

Эти скрипты позволяют быстро получить скриншот экрана Android устройства, подключенного по USB через ADB.

## Требования

1. **Android SDK Platform Tools** - должен быть установлен ADB
   - Скачать можно с [официального сайта](https://developer.android.com/studio/releases/platform-tools)
   - Или установить через Android Studio SDK Manager
   - Убедитесь, что `adb` доступен в PATH

2. **Подключенное устройство**:
   - Включите "Отладка по USB" в настройках разработчика
   - Подключите устройство по USB
   - Разрешите отладку по USB на устройстве (при первом подключении)

## Использование

### Windows (Batch)

```bash
# Базовое использование (сохранит в screenshots/)
scripts\screenshot.bat

# С указанием пути
scripts\screenshot.bat C:\Users\YourName\Desktop
```

### Windows (PowerShell)

```powershell
# Базовое использование
.\scripts\screenshot.ps1

# С указанием пути
.\scripts\screenshot.ps1 -OutputPath "C:\Users\YourName\Desktop"

# С автоматическим открытием скриншота
.\scripts\screenshot.ps1 -Open

# Комбинация параметров
.\scripts\screenshot.ps1 -OutputPath "C:\Users\YourName\Desktop" -Open
```

### Linux/macOS

```bash
# Сделать скрипт исполняемым (первый раз)
chmod +x scripts/screenshot.sh

# Базовое использование
./scripts/screenshot.sh

# С указанием пути
./scripts/screenshot.sh ~/Desktop
```

## Быстрая команда (одна строка)

### Windows (CMD)
```cmd
adb exec-out screencap -p > screenshot_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%.png
```

### Windows (PowerShell)
```powershell
adb exec-out screencap -p | Out-File -Encoding binary "screenshot_$(Get-Date -Format 'yyyyMMdd_HHmmss').png"
```

### Linux/macOS
```bash
adb exec-out screencap -p > screenshot_$(date +%Y%m%d_%H%M%S).png
```

## Проверка подключения устройства

Перед использованием проверьте, что устройство подключено:

```bash
adb devices
```

Должна быть строка с `device` в конце (не `unauthorized` или `offline`).

## Альтернативные методы

### Метод 1: Прямой вывод (самый быстрый)
```bash
adb exec-out screencap -p > screenshot.png
```

### Метод 2: Через временный файл (более надежный)
```bash
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
adb shell rm /sdcard/screenshot.png
```

### Метод 3: С автоматическим именованием
```bash
adb exec-out screencap -p > "screenshot_$(date +%Y%m%d_%H%M%S).png"
```

## Устранение проблем

### ADB не найден
- Установите Android SDK Platform Tools
- Добавьте путь к `adb` в переменную окружения PATH
- Или используйте полный путь: `C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools\adb.exe`

### Устройство не обнаружено
- Проверьте USB кабель
- Убедитесь, что включена отладка по USB
- Разрешите отладку на устройстве
- Попробуйте переподключить устройство

### Ошибка доступа
- Убедитесь, что у устройства есть разрешение на запись в `/sdcard/`
- Проверьте, что устройство разблокировано

## Интеграция с IDE

Можно добавить скрипт в задачи VS Code или другой IDE для быстрого доступа через горячие клавиши.








