import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WelcomePage = ({ navigation }) => {
  const handleStart = () => {
    // Kullanıcı "Hadi Başlayalım" butonuna tıkladığında nereye yönlendirilmesini belirler
    navigation.navigate('RegisterPage'); // Kaydolmak üzere kullanıcıyı RegisterPage'e Yönlendirir.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoşgeldiniz!</Text>
      <Text style={styles.description}>
        Su tüketiminizi takip etmek ve sağlıklı kalmak için bu uygulamayı kullanabilirsiniz. 
        Günlük su ihtiyacınızı takip edin ve hatırlatmalar alın. Su içmeyi unutmayın!
      </Text>
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Hadi Başlayalım</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff', // Hafif arka plan rengi
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Başlık rengi
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#555', // Açıklama rengi
  },
  startButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default WelcomePage;
