import { useStores } from '../stores';
import { getThemeColors } from '../theme/colors';
import { observer } from 'mobx-react-lite';

export const useTheme = () => {
    const { uiStore } = useStores();
    const colors = getThemeColors(uiStore.isDark);

    return {
        colors,
        isDark: uiStore.isDark,
        toggleTheme: () => uiStore.toggleTheme(),
        setTheme: (isDark: boolean) => uiStore.setTheme(isDark),
    };
};
