import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';

export const useThemedStyles = (styleCreator) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return {
    styles: useMemo(() => styleCreator(theme), [theme]),
    theme,
    isDarkMode
  };
}; 