import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { DataProvider } from './src/context/DataContext';
import HomeScreen from './src/screens/HomeScreen';
import BoxesScreen from './src/screens/BoxesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BoxDetailScreen from './src/screens/BoxDetailScreen';
import AddBoxScreen from './src/screens/AddBoxScreen';
import AddCardScreen from './src/screens/AddCardScreen';
import CardDetailScreen from './src/screens/CardDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcons = { Home: 'home', Boxes: 'cube', Settings: 'settings' };

function Tabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.icon,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? tabIcons[route.name] : `${tabIcons[route.name]}-outline`}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Boxes" component={BoxesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { colors, isDark } = useTheme();

  // Give the navigation bars our colors
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BoxDetail"
          component={BoxDetailScreen}
          options={{ title: 'Box', gestureEnabled: false }}
        />
        <Stack.Screen
          name="AddBox"
          component={AddBoxScreen}
          options={{ title: 'New Box', presentation: 'modal' }}
        />
        <Stack.Screen
          name="AddCard"
          component={AddCardScreen}
          options={{ title: 'New Memory', presentation: 'modal' }}
        />
        <Stack.Screen
          name="CardDetail"
          component={CardDetailScreen}
          options={{ title: 'Memory' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <Root />
      </DataProvider>
    </ThemeProvider>
  );
}