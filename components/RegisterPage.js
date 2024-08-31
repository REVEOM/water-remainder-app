import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Kullanıcının su tüketim hedefini hesaplamak için basit bir fonksiyon
  const calculateWaterIntake = (age, weight) => {
    return (weight * 30).toFixed(2);
  };

  // Kullanıcı verilerini AsyncStorage'a kaydetme fonksiyonu
  const storeUserData = async () => {
    const userData = {
      username,
      password,
      email,
      age,
      weight,
      waterIntakeGoal: calculateWaterIntake(age, weight),
    };

    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem('@user_data', jsonValue);
      Alert.alert('Kayıt Başarılı', 'Kayıt başarılı! Verileriniz kaydedildi.');

      // Form alanlarını sıfırla
      setUsername('');
      setPassword('');
      setEmail('');
      setAge('');
      setWeight('');
      setIsTermsAccepted(false);

      // Başarılı kayıt sonrası Login sayfasına yönlendirme
      navigation.navigate('LoginPage');
    } catch (e) {
      console.error('Error saving user data:', e);
      Alert.alert('Kayıt Hatası', 'Veriler kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  // E-posta doğrulama fonksiyonu
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = () => {
    if (!username || !password || !email || !age || !weight) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (isNaN(age) || isNaN(weight)) {
      Alert.alert('Geçersiz Girdi', 'Lütfen yaş ve kilo için sayısal bir değer giriniz.');
      return;
    }

    if (!isTermsAccepted) {
      Alert.alert('Onay Gerekiyor', 'Kullanıcı sözleşmesini ve kişisel verilerin korunması kanununu kabul etmelisiniz.');
      return;
    }

    // Kullanıcı verilerini AsyncStorage'a kaydet
    storeUserData();
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
        placeholder="E-posta"
        onChangeText={(text) => setEmail(text)}
        value={email}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Şifre"
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
        style={styles.input}
      />
      <TextInput
        placeholder="Yaş"
        keyboardType="numeric"
        onChangeText={(text) => setAge(text)}
        value={age}
        style={styles.input}
      />
      <TextInput
        placeholder="Kilo (kg)"
        keyboardType="numeric"
        onChangeText={(text) => setWeight(text)}
        value={weight}
        style={styles.input}
      />
      <View style={styles.termsContainer}>
        <Switch
          value={isTermsAccepted}
          onValueChange={setIsTermsAccepted}
          trackColor={{ true: '#007BFF', false: 'gray' }}
          thumbColor={isTermsAccepted ? '#007BFF' : '#f4f3f4'}
        />
        <Text style={styles.termsText}>
          Kullanıcı sözleşmesini ve{' '}
          <Text style={styles.link} onPress={() => Alert.alert('Bilgi', 'Kişisel Verilerin Korunması Kanunu hakkında bilgi')}>
            kişisel verilerin korunması kanununu
          </Text>{' '}
          kabul ediyorum.
        </Text>
      </View>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Kayıt Ol</Text>
      </TouchableOpacity>
      
      {/* Eğer bir hesabınız varsa buraya tıklayınız kısmı */}
      <TouchableOpacity onPress={() => navigation.navigate('LoginPage')}>
        <Text style={styles.loginText}>Eğer bir hesabınız varsa buraya tıklayınız</Text>
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
  },
  loginText: {
    color: '#007BFF',
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default RegisterPage;
