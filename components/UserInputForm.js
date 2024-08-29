import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserInputForm = ({ navigation }) => {
  const [waterIntakeGoal, setWaterIntakeGoal] = useState(0);
  const [waterIntake, setWaterIntake] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@user_data');
        const storedUserData = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (storedUserData) {
          const currentDate = new Date();
          const lastUpdatedDate = new Date(storedUserData.lastUpdated);

          // Su hedefini sadece 24 saatte bir güncelle
          if (currentDate - lastUpdatedDate >= 24 * 60 * 60 * 1000) {
            const newWaterIntakeGoal = (storedUserData.weight * 30).toFixed(2);
            storedUserData.waterIntakeGoal = newWaterIntakeGoal;
            storedUserData.lastUpdated = currentDate.toISOString(); // Güncelleme tarihini kaydet

            const jsonValueUpdated = JSON.stringify(storedUserData);
            await AsyncStorage.setItem('@user_data', jsonValueUpdated);
            setWaterIntakeGoal(newWaterIntakeGoal);
          } else {
            setWaterIntakeGoal(storedUserData.waterIntakeGoal);
          }
        }
      } catch (e) {
        console.error('Error fetching user data:', e);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@user_data');
      const storedUserData = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storedUserData) {
        const updatedWaterIntake = parseFloat(storedUserData.waterIntake || 0) + parseFloat(waterIntake);
        storedUserData.waterIntake = updatedWaterIntake.toFixed(2);

        // Calculate remaining water intake goal
        const remainingGoal = storedUserData.waterIntakeGoal - storedUserData.waterIntake;

        const jsonValueUpdated = JSON.stringify(storedUserData);
        await AsyncStorage.setItem('@user_data', jsonValueUpdated);

        Alert.alert('Su İçme Güncellendi', `İçtiğiniz su miktarı eklendi. Günlük su hedefinizden ${remainingGoal.toFixed(2)} litre kaldı.`);
      }
    } catch (e) {
      console.error('Error updating user data:', e);
      Alert.alert('Hata', 'Su miktarınızı güncellerken bir hata oluştu.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yapmak Üzeresiniz',
      'Çıkış yaparsanız bütün verileriniz silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@user_data');
              navigation.navigate('LoginPage');
            } catch (e) {
              console.error('Error clearing user data:', e);
              Alert.alert('Çıkış Hatası', 'Çıkış yaparken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Günlük Su Hedefiniz: {waterIntakeGoal} litre</Text>
      <TextInput
        placeholder="Bugün İçtiğiniz Su (litre)"
        keyboardType="numeric"
        onChangeText={(text) => setWaterIntake(text)}
        value={waterIntake}
        style={styles.input}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Su Miktarını Güncelle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
      <Text style={styles.warningText}>
        Çıkış yaparsanız bütün verileriniz silinecektir.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderRadius: 20,
    height: 60,
    borderColor: 'black',
    borderWidth: 3,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
  },
  warningText: {
    fontSize: 14,
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default UserInputForm;
