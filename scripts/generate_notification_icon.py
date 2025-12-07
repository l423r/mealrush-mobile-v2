"""
Скрипт для генерации монохромной иконки уведомлений для Android
Android требует белые иконки на прозрачном фоне для уведомлений
"""
import os
import sys
from PIL import Image, ImageOps

def create_monochrome_notification_icon(source_path, project_root=None):
    """
    Создает монохромную (белую) иконку уведомлений из исходной иконки
    """
    if not os.path.exists(source_path):
        print(f"Ошибка: Исходный файл не найден: {source_path}")
        return False

    try:
        # Открываем исходное изображение
        img = Image.open(source_path)
        print(f"Загружено изображение: {img.size[0]}x{img.size[1]}")
    except Exception as e:
        print(f"Ошибка при открытии изображения: {e}")
        return False

    # Конвертируем в RGBA если нужно
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Создаем монохромную версию (белая на прозрачном фоне)
    # Метод 1: Преобразуем в grayscale, затем инвертируем и делаем белым
    gray = img.convert('L')
    
    # Создаем новое изображение с прозрачным фоном
    monochrome = Image.new('RGBA', img.size, (0, 0, 0, 0))
    
    # Берем альфа-канал из исходного изображения
    alpha = img.split()[3]
    
    # Создаем белое изображение с исходной альфой
    # Используем яркость для определения прозрачности
    pixels = []
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            r, g, b, a = img.getpixel((x, y))
            # Вычисляем яркость
            brightness = (r * 0.299 + g * 0.587 + b * 0.114)
            # Используем яркость для альфа-канала белого пикселя
            alpha_value = int(brightness * (a / 255.0))
            pixels.append((255, 255, 255, alpha_value))
    
    monochrome.putdata(pixels)

    # Размеры для разных плотностей Android (24dp = базовый размер)
    android_sizes = {
        'drawable-mdpi': (24, 24),      # 1x
        'drawable-hdpi': (36, 36),      # 1.5x
        'drawable-xhdpi': (48, 48),     # 2x
        'drawable-xxhdpi': (72, 72),    # 3x
        'drawable-xxxhdpi': (96, 96),   # 4x
    }

    if project_root:
        android_res_dir = os.path.join(project_root, 'android', 'app', 'src', 'main', 'res')
        
        if not os.path.exists(android_res_dir):
            print(f"Ошибка: Директория Android resources не найдена: {android_res_dir}")
            return False

        print(f"\nГенерация иконок уведомлений в {android_res_dir}...")
        
        for drawable_name, size in android_sizes.items():
            drawable_dir = os.path.join(android_res_dir, drawable_name)
            
            # Создаем директорию, если её нет
            if not os.path.exists(drawable_dir):
                os.makedirs(drawable_dir)
                print(f"Создана директория: {drawable_name}")
            
            # Масштабируем иконку
            resized = monochrome.resize(size, Image.Resampling.LANCZOS)
            
            # Сохраняем как PNG
            output_path = os.path.join(drawable_dir, 'notification_icon.png')
            resized.save(output_path, 'PNG')
            print(f"[OK] Создана {drawable_name}/notification_icon.png ({size[0]}x{size[1]})")
        
        print("\n[SUCCESS] Иконки уведомлений успешно созданы!")
        print("\nВажно: После создания иконок выполните:")
        print("  1. Пересоберите приложение: npx expo prebuild --clean")
        print("  2. Или пересоберите Android проект: cd android && ./gradlew clean")
        return True
    else:
        print("Ошибка: Не указан project_root")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python generate_notification_icon.py <source_icon_path> [--project-root <path>]")
        print("\nПример:")
        print("  python generate_notification_icon.py assets/icon.png --project-root .")
        sys.exit(1)

    source = sys.argv[1]
    project_root = None
    
    # Парсинг аргументов
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == '--project-root':
            if i + 1 < len(args):
                project_root = args[i+1]
                i += 2
            else:
                print("Ошибка: --project-root требует путь")
                sys.exit(1)
        else:
            if project_root is None:
                project_root = args[i]
            i += 1
    
    # Если project_root не указан, используем текущую директорию
    if project_root is None:
        project_root = os.getcwd()
    
    # Если source - относительный путь, делаем его абсолютным относительно project_root
    if not os.path.isabs(source):
        source = os.path.join(project_root, source)
    
    success = create_monochrome_notification_icon(source, project_root)
    sys.exit(0 if success else 1)

