"""
Общий хелпер для создания одного приёма пищи через UI в E2E тестах.
Переиспользуется в test_meal_creation и test_view_meal_history (setup).
"""
import time


def create_meal_via_ui(driver, main_page, search_page, product_query, meal_type,
                       verify_date=True, handle_confirm_dialog='create_new'):
    """
    Создаёт один приём пищи через UI: FAB → Search → продукт → тип приёма → Добавить.

    Args:
        driver: WebDriver instance
        main_page: MainPage instance
        search_page: SearchPage instance
        product_query: Поисковый запрос продукта
        meal_type: Тип приема пищи ('BREAKFAST', 'LUNCH', 'DINNER', etc.)
        verify_date: Проверять ли дату перед созданием meal
        handle_confirm_dialog: Как обрабатывать модальное окно подтверждения:
            - 'create_new' - создать новый прием (по умолчанию)
            - 'add_to_existing' - добавить к существующему
            - 'cancel' - отменить
            - None - не обрабатывать (если диалог не ожидается)

    Returns:
        bool: True если meal создан успешно
    """
    from pages.meal_element_page import MealElementPage
    try:
        from utilities.timing import timer
    except ImportError:
        timer = None

    start_time = time.perf_counter()

    expected_date = None
    if verify_date and timer:
        with timer.measure("get_selected_date", category="helper"):
            expected_date = main_page.get_selected_date_text()
    elif verify_date:
        expected_date = main_page.get_selected_date_text()
    if verify_date and expected_date:
        print(f"[CREATE_MEAL] Ожидаемая дата для meal: {expected_date}")

    print(f"[CREATE_MEAL] Открываем поиск для '{product_query}'...")
    if timer:
        with timer.measure("click_add_meal_button", category="helper"):
            main_page.click_add_meal_button()
    else:
        main_page.click_add_meal_button()

    if not search_page.is_page_loaded(timeout=3):
        print("[CREATE_MEAL] ⚠ SearchScreen не загрузился")
        driver.back()
        return False

    print(f"[CREATE_MEAL] Ищем продукт '{product_query}'...")
    if timer:
        with timer.measure("search_product", category="helper"):
            search_page.search_product(product_query, take_screenshot=False)
    else:
        search_page.search_product(product_query, take_screenshot=False)

    products_count = search_page.get_products_count()
    if products_count == 0:
        print("[CREATE_MEAL] ⚠ Продукты не найдены")
        driver.back()
        return False
    print(f"[CREATE_MEAL] Найдено продуктов: {products_count}")

    print("[CREATE_MEAL] Кликаем на первый продукт...")
    if timer:
        with timer.measure("click_product", category="helper"):
            search_page.click_product(0)
    else:
        search_page.click_product(0)

    meal_element_page = MealElementPage(driver)
    if not meal_element_page.is_page_loaded(timeout=3):
        print("[CREATE_MEAL] ⚠ MealElementScreen не загрузился")
        driver.back()
        return False

    if verify_date and expected_date:
        displayed_date = meal_element_page.get_displayed_date()
        if displayed_date:
            print(f"[CREATE_MEAL] Дата на MealElementScreen: {displayed_date}")
        else:
            print("[CREATE_MEAL] ⚠ Дата не отображается на MealElementScreen (может быть нормально)")

    print(f"[CREATE_MEAL] Выбираем тип приема пищи: {meal_type}")
    if timer:
        with timer.measure("select_meal_type", category="helper"):
            meal_element_page.select_meal_type(meal_type)
    else:
        meal_element_page.select_meal_type(meal_type)

    print("[CREATE_MEAL] Нажимаем кнопку добавления...")
    if timer:
        with timer.measure("click_add_button", category="helper"):
            meal_element_page.click_add_button(handle_confirm_dialog=handle_confirm_dialog)
    else:
        meal_element_page.click_add_button(handle_confirm_dialog=handle_confirm_dialog)

    print("[CREATE_MEAL] Ожидание возврата на главный экран...")
    if timer:
        with timer.measure("wait_main_page_load", category="helper"):
            if not main_page.is_page_loaded(timeout=2):
                print("[CREATE_MEAL] ⚠ Главный экран не загрузился быстро, ждем еще...")
                main_page.is_page_loaded(timeout=3)
    else:
        if not main_page.is_page_loaded(timeout=2):
            main_page.is_page_loaded(timeout=3)

    if verify_date and expected_date:
        current_date_text = main_page.get_selected_date_text()
        if current_date_text and current_date_text != expected_date:
            print(f"[CREATE_MEAL] ⚠ Внимание: дата изменилась после создания meal: {expected_date} -> {current_date_text}")

    duration = (time.perf_counter() - start_time) * 1000
    print(f"[CREATE_MEAL] ✓ Meal создан за {duration:.0f}ms")
    return True
