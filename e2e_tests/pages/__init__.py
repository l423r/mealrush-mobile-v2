# Pages Package
# Page Objects for E2E testing

from .main_page import MainPage
from .search_page import SearchPage
from .meal_page import MealPage
from .meal_element_page import MealElementPage
from .sign_in_page import SignInPage
from .registration_page import RegistrationPage
from .profile_page import ProfilePage
from .profile_setup_page import ProfileSetupPage
from .settings_page import SettingsPage
from .meal_history_page import MealHistoryPage
from .date_range_picker_page import DateRangePickerPage
from .calendar_modal_page import CalendarModalPage

__all__ = [
    'MainPage',
    'SearchPage',
    'MealPage',
    'MealElementPage',
    'SignInPage',
    'RegistrationPage',
    'ProfilePage',
    'ProfileSetupPage',
    'SettingsPage',
    'MealHistoryPage',
    'DateRangePickerPage',
    'CalendarModalPage',
]