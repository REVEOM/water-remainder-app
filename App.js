import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import WelcomePage from './components/WelcomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import UserInputForm from './components/UserInputForm';

const Stack = createStackNavigator();

const App = (x) => {
  const [initialRoute, setInitialRoute] = useState('WelcomePage');

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user_data');
        if (userData) {
          setInitialRoute('UserInputForm');
        }
      } catch (e) {
        console.error('Error checking login status:', e);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WelcomePage" component={WelcomePage} />
        <Stack.Screen name="RegisterPage" component={RegisterPage} />
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="UserInputForm" component={UserInputForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
