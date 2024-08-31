import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    try {
      const jsonValue = await AsyncStorage.getItem('@user_data');
      const storedUserData = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storedUserData) {
        if (storedUserData.username === username && storedUserData.password === password) {
          Alert.alert('Giriş Başarılı', 'Hoşgeldiniz ' + storedUserData.username + '!');
          await AsyncStorage.setItem('@is_logged_in', 'true'); // Oturum durumunu kaydediyoruz
          navigation.replace('UserInputForm'); // replace kullanarak geri dönmeyi engelleriz
        } else {
          Alert.alert('Giriş Hatası', 'Kullanıcı adı veya şifre hatalı.');
        }
      } else {
        Alert.alert('Giriş Hatası', 'Kayıtlı kullanıcı bulunamadı. Lütfen önce kayıt olun.');
      }
    } catch (e) {
      console.error('Error reading user data:', e);
      Alert.alert('Giriş Hatası', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Kullanıcı Adı"
        onChangeText={(text) => setUsername(text)}
        value={username}
        style={styles.input}
      />
      <TextInput
        placeholder="Şifre"
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
        style={styles.input}
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  input: {
    borderRadius: 20,
    height: 60,
    borderColor: 'black',
    borderWidth: 3,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default LoginPage;
