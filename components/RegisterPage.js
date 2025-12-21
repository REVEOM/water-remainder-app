import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';

const RegisterPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Kullanıcının su tüketim hedefini hesaplamak için basit bir fonksiyon
  const calculateWaterIntake = (weight) => {
    return (parseFloat(weight) * 30).toFixed(0); // ml cinsinden
  };

  // Kullanıcı verilerini AsyncStorage'a kaydetme fonksiyonu
  const storeUserData = async () => {
    const userData = {
      username,
      password,
      email,
      age,
      weight: parseFloat(weight),
      waterIntakeGoal: calculateWaterIntake(weight),
      createdAt: new Date().toISOString(),
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

      // Başarılı kayıt sonrası Home sayfasına yönlendirme
      navigation.replace('Home');
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
      Alert.alert('Onay Gerekiyor', 'Kullanıcı sözleşmesini kabul etmelisiniz.');
      return;
    }

    // Kullanıcı verilerini AsyncStorage'a kaydet
    storeUserData();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>Hesabını oluştur ve su içmeye başla! 💧</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
            <TextInput
              placeholder="kullanici_adi"
              placeholderTextColor={colors.textMuted}
              onChangeText={(text) => setUsername(text)}
              value={username}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <TextInput
              placeholder="ornek@email.com"
              placeholderTextColor={colors.textMuted}
              onChangeText={(text) => setEmail(text)}
              value={email}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Şifre</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
              value={password}
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.inputLabel}>Yaş</Text>
              <TextInput
                placeholder="25"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                onChangeText={(text) => setAge(text)}
                value={age}
                style={styles.input}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: spacing.sm }]}>
              <Text style={styles.inputLabel}>Kilo (kg)</Text>
              <TextInput
                placeholder="70"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                onChangeText={(text) => setWeight(text)}
                value={weight}
                style={styles.input}
              />
            </View>
          </View>

          {/* Su hedefi önizleme */}
          {weight && !isNaN(weight) && (
            <View style={styles.goalPreview}>
              <Text style={styles.goalPreviewLabel}>Günlük Su Hedefin:</Text>
              <Text style={styles.goalPreviewValue}>{calculateWaterIntake(weight)} ml</Text>
            </View>
          )}

          <View style={styles.termsContainer}>
            <Switch
              value={isTermsAccepted}
              onValueChange={setIsTermsAccepted}
              trackColor={{ true: colors.primary, false: colors.surfaceLight }}
              thumbColor={isTermsAccepted ? colors.text : colors.textMuted}
            />
            <Text style={styles.termsText}>
              Kullanıcı sözleşmesini ve{' '}
              <Text style={styles.link} onPress={() => Alert.alert('KVKK', 'Kişisel Verilerin Korunması Kanunu hakkında bilgi')}>
                KVKK
              </Text>
              {' '}kabul ediyorum.
            </Text>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Kayıt Ol</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('LoginPage')}
          >
            <Text style={styles.loginLinkText}>
              Zaten hesabın var mı? <Text style={styles.loginLinkHighlight}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxl + spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    height: 56,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  row: {
    flexDirection: 'row',
  },
  goalPreview: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  goalPreviewLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  goalPreviewValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  termsText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.glow,
  },
  registerButtonText: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  loginLinkHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default RegisterPage;
