import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const WelcomePage = ({ navigation }) => {
  const handleStart = () => {
    // Kullanıcı "Hadi Başlayalım" butonuna tıkladığında nereye yönlendirilmesini belirler
    navigation.navigate('RegisterPage'); //Kaydolmak üzere kullanıcıyı RegisterPage'e Yönlendirir.
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
    marginTop:150,
    alignItems: 'center',
    padding: 40,
    
  },
 
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 100,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 100,
  },
  startButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default WelcomePage;

