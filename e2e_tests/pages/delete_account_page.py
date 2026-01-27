"""
Page Object для экрана удаления аккаунта (Delete Account)
"""
import os
import sys
import time
from selenium.webdriver.common.by import By

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utilities.base_page import BasePage


class DeleteAccountPage(BasePage):
    """Класс для работы с экраном удаления аккаунта"""
    
    # Locators
    DELETE_ACCOUNT_SCREEN_TITLE = [
        (By.XPATH, "//*[@text='Удаление аккаунта' or contains(@text, 'Удаление аккаунта')]"),
    ]
    
    WARNING_TITLE = [
        (By.XPATH, "//*[@text='Внимание!' or contains(@text, 'Внимание')]"),
    ]
    
    WARNING_MESSAGE = [
        (By.XPATH, "//*[contains(@text, 'необратимое действие') or contains(@text, 'безвозвратно удалены')]"),
    ]
    
    DELETE_BUTTON = [
        (By.XPATH, "//*[@text='Удалить аккаунт' or contains(@text, 'Удалить аккаунт')]"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Удалить')]"),
    ]
    
    CONFIRM_DIALOG_TITLE = [
        (By.XPATH, "//*[@text='Удаление аккаунта' or contains(@text, 'Удаление аккаунта')]"),
    ]
    
    CONFIRM_DIALOG_MESSAGE = [
        (By.XPATH, "//*[contains(@text, 'Вы уверены') or contains(@text, 'необратимо')]"),
    ]
    
    CONFIRM_BUTTON = [
        (By.XPATH, "//*[@text='Да, удалить' or contains(@text, 'Да, удалить')]"),
        (By.XPATH, "//*[@text='Удалить' or contains(@text, 'Удалить')]"),
    ]
    
    CANCEL_BUTTON = [
        (By.XPATH, "//*[@text='Отмена' or contains(@text, 'Отмена')]"),
    ]
    
    SECOND_CONFIRM_DIALOG_TITLE = [
        (By.XPATH, "//*[@text='Последнее предупреждение' or contains(@text, 'Последнее предупреждение')]"),
    ]
    
    SECOND_CONFIRM_BUTTON = [
        (By.XPATH, "//*[@text='Да, удалить' or contains(@text, 'Да, удалить')]"),
    ]
    
    BACK_BUTTON = [
        (By.XPATH, "//*[@text='←']"),
        (By.XPATH, "//android.widget.TextView[@text='←']/..")
    ]
    
    def __init__(self, driver):
        super().__init__(driver)
        self.page_identifier = self.DELETE_ACCOUNT_SCREEN_TITLE
    
    def is_page_loaded(self, timeout=None):
        """Проверяет, загрузилась ли страница удаления аккаунта"""
        if timeout is None:
            timeout = 10
        return self.is_displayed_multiple(self.DELETE_ACCOUNT_SCREEN_TITLE, timeout=timeout)
    
    def has_warning(self):
        """Проверяет, есть ли предупреждение на странице"""
        try:
            return self.is_displayed_multiple(self.WARNING_TITLE, timeout=2)
        except:
            return False
    
    def click_delete_account(self):
        """Кликает на кнопку удаления аккаунта"""
        self.click_multiple(self.DELETE_BUTTON)
        time.sleep(1)  # Ожидание появления диалога подтверждения
        return self
    
    def is_confirm_dialog_visible(self):
        """Проверяет, виден ли диалог подтверждения"""
        try:
            return self.is_displayed_multiple(self.CONFIRM_DIALOG_TITLE, timeout=2)
        except:
            return False
    
    def confirm_deletion(self):
        """Подтверждает удаление аккаунта в первом диалоге"""
        try:
            if self.is_confirm_dialog_visible():
                self.click_multiple(self.CONFIRM_BUTTON)
                time.sleep(2)  # Ожидание закрытия первого диалога и появления второго
        except Exception as e:
            print(f"Warning: Could not confirm deletion in first dialog: {e}")
        return self
    
    def is_second_confirm_dialog_visible(self):
        """Проверяет, виден ли второй диалог подтверждения"""
        try:
            # Увеличиваем таймаут, так как есть задержка между закрытием первого и показом второго диалога
            return self.is_displayed_multiple(self.SECOND_CONFIRM_DIALOG_TITLE, timeout=5)
        except:
            return False
    
    def confirm_second_deletion(self):
        """Подтверждает удаление аккаунта во втором диалоге"""
        try:
            if self.is_second_confirm_dialog_visible():
                self.click_multiple(self.SECOND_CONFIRM_BUTTON)
                time.sleep(2)  # Ожидание выполнения удаления
        except Exception as e:
            print(f"Warning: Could not confirm deletion in second dialog: {e}")
        return self
    
    def cancel_deletion(self):
        """Отменяет удаление аккаунта"""
        try:
            if self.is_confirm_dialog_visible() or self.is_second_confirm_dialog_visible():
                self.click_multiple(self.CANCEL_BUTTON)
                time.sleep(1)
        except Exception as e:
            print(f"Warning: Could not cancel deletion: {e}")
        return self
    
    def click_back(self):
        """Кликает на кнопку назад"""
        try:
            self.click_multiple(self.BACK_BUTTON, timeout=3)
        except Exception:
            self.driver.back()
        time.sleep(2)
        return self
