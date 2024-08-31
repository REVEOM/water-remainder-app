import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import PushNotification from 'react-native-push-notification';


const UserInputForm = () => {
  const [waterIntakeGoal, setWaterIntakeGoal] = useState(0);
  const [waterIntake, setWaterIntake] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    // Bildirim yapılandırması
    PushNotification.configure({
      onNotification: function (notification) {
        console.log("Notification received:", notification);
      },
      // Gereksiz izinleri istemekten kaçının
      requestPermissions: Platform.OS === 'ios',
    });

    const resetNavigation = () => {
      // Navigasyon yığınını sıfırla ve sadece 'UserInputForm' ekranını tut
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserInputForm' }],
      });
    };

    resetNavigation(); 

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
  }, []); // Boş bir bağımlılık dizisiyle, useEffect sadece bileşen ilk kez render edildiğinde çalışır.

  useEffect(() => {
    const scheduleNotifications = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@user_data');
        const storedUserData = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (storedUserData && storedUserData.waterIntake < storedUserData.waterIntakeGoal) {
          // İlk bildirim 1 saat sonra
          PushNotification.localNotificationSchedule({
            message: "Su içme zamanınız geldi!",
            date: new Date(Date.now() + 60 * 60 * 1000) // 1 saat sonra
          });

          // Sonraki bildirimler 3 dakikada bir
          const intervalId = setInterval(() => {
            PushNotification.localNotification({
              message: "Su içme zamanı!",
            });
          }, 3 * 60 * 1000); // 3 dakikada bir

          // Bildirimler için clear işlemi, componentWillUnmount için bir clean-up return
          return () => clearInterval(intervalId);
        }
      } catch (e) {
        console.error('Error scheduling notifications:', e);
      }
    };

    scheduleNotifications();
  }, [waterIntakeGoal]); // waterIntakeGoal değiştiğinde yeniden planla

  const handleSubmit = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@user_data');
      const storedUserData = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storedUserData) {
        const updatedWaterIntake = parseFloat(storedUserData.waterIntake || 0) + parseFloat(waterIntake);
        storedUserData.waterIntake = updatedWaterIntake.toFixed(2);

        // Hedefe ulaşıldı mı kontrol et
        if (updatedWaterIntake >= storedUserData.waterIntakeGoal) {
          PushNotification.cancelAllLocalNotifications();
        }

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

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yapmak Üzeresiniz',
      'Çıkış yaparsanız verileriniz saklanmaya devam edecektir, sadece oturumunuz kapatılacaktır.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          onPress: () => {
            // Kullanıcının sadece çıkış yapmasını ve verileri saklamaya devam etmesini sağla
            navigation.navigate('LoginPage');
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
        Çıkış yaparsanız verileriniz saklanmaya devam edecektir, sadece oturumunuz kapatılacaktır.
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
