# Скрипт PowerShell для получения скриншота с Android устройства через ADB
# Использование: .\screenshot.ps1 [путь_для_сохранения] [-Open]

param(
    [string]$OutputPath = "",
    [switch]$Open = $false
)

# Проверка наличия ADB
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbPath) {
    Write-Host "Ошибка: ADB не найден в PATH. Убедитесь, что Android SDK Platform Tools установлены." -ForegroundColor Red
    exit 1
}

# Проверка подключения устройства
$devices = adb devices | Select-String "device$"
if (-not $devices) {
    Write-Host "Ошибка: Устройство не подключено или не авторизовано." -ForegroundColor Red
    Write-Host "Убедитесь, что:" -ForegroundColor Yellow
    Write-Host "  1. USB отладка включена на устройстве" -ForegroundColor Yellow
    Write-Host "  2. Устройство подключено по USB" -ForegroundColor Yellow
    Write-Host "  3. Вы разрешили отладку по USB на устройстве" -ForegroundColor Yellow
    adb devices
    exit 1
}

# Определение пути для сохранения
if ([string]::IsNullOrEmpty($OutputPath)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $OutputPath = Join-Path $scriptDir "..\screenshots"
}

# Создание папки, если её нет
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Генерация имени файла с timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$screenshotFile = Join-Path $OutputPath "screenshot_$timestamp.png"

# Временный файл на устройстве
$deviceFile = "/sdcard/screenshot_temp.png"

Write-Host "Получение скриншота с устройства..." -ForegroundColor Cyan
adb shell screencap -p $deviceFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка: Не удалось создать скриншот на устройстве." -ForegroundColor Red
    exit 1
}

Write-Host "Копирование файла на компьютер..." -ForegroundColor Cyan
adb pull $deviceFile $screenshotFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка: Не удалось скопировать файл с устройства." -ForegroundColor Red
    exit 1
}

# Удаление временного файла с устройства
adb shell rm $deviceFile | Out-Null

Write-Host "Скриншот сохранен: $screenshotFile" -ForegroundColor Green

# Открыть скриншот, если указан флаг -Open
if ($Open) {
    Start-Process $screenshotFile
}




