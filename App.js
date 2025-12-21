import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, AppState } from 'react-native';

// Screens
import WelcomePage from './components/WelcomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import UserInputForm from './components/UserInputForm';
import HomePage from './components/HomePage';
import PhotoVerificationModal from './components/PhotoVerificationModal';
import HistoryPage from './components/HistoryPage';
import SettingsPage from './components/SettingsPage';

// Services
import NotificationService from './services/NotificationService';

const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const navigationRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Bildirim izinlerini al
        await NotificationService.requestPermissions();

        // Kullanıcı giriş durumunu kontrol et
        const userData = await AsyncStorage.getItem('@user_data');
        if (userData) {
          setInitialRoute('Home');

          // Bildirimleri başlat (sadece giriş yapmış kullanıcılar için)
          const interval = await NotificationService.getNotificationInterval();
          await NotificationService.scheduleWaterReminder(interval);
        } else {
          setInitialRoute('WelcomePage');
        }
      } catch (e) {
        console.error('Initialization error:', e);
        setInitialRoute('WelcomePage');
      }
    };

    initialize();

    // App state değişikliklerini dinle
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Uygulama ön plana geldiğinde verileri yenile
        if (navigationRef.current?.getCurrentRoute()?.name === 'Home') {
          // HomePage'i refresh et
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      NotificationService.removeListeners();
    };
  }, []);

  // Navigation hazır olduğunda bildirim dinleyicilerini kur
  const onNavigationReady = () => {
    if (navigationRef.current) {
      NotificationService.setupListeners(navigationRef.current);
    }
  };

  // Yüklenene kadar bekle
  if (!initialRoute) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      <NavigationContainer
        ref={navigationRef}
        onReady={onNavigationReady}
      >
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0A1929' },
          }}
        >
          {/* Auth Screens */}
          <Stack.Screen name="WelcomePage" component={WelcomePage} />
          <Stack.Screen name="RegisterPage" component={RegisterPage} />
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="UserInputForm" component={UserInputForm} />

          {/* Main App Screens */}
          <Stack.Screen name="Home" component={HomePage} />
          <Stack.Screen
            name="PhotoVerification"
            component={PhotoVerificationModal}
            options={{
              presentation: 'modal',
              gestureEnabled: false, // Fotoğraf çekmeden kapatılamaz
            }}
          />
          <Stack.Screen name="History" component={HistoryPage} />
          <Stack.Screen name="Settings" component={SettingsPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
