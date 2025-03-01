import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    // ... your settings screen JSX
    <Switch
      value={isDarkMode}
      onValueChange={toggleTheme}
    />
    // ...
  );
}; 