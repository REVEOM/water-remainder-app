import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    setIsLoading(true);

    try {
      const jsonValue = await AsyncStorage.getItem('@user_data');
      const storedUserData = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (storedUserData) {
        if (storedUserData.username === username && storedUserData.password === password) {
          Alert.alert('Hoşgeldin! 💧', `Merhaba ${storedUserData.username}!`);
          await AsyncStorage.setItem('@is_logged_in', 'true');
          navigation.replace('Home');
        } else {
          Alert.alert('Giriş Hatası', 'Kullanıcı adı veya şifre hatalı.');
        }
      } else {
        Alert.alert('Giriş Hatası', 'Kayıtlı kullanıcı bulunamadı. Lütfen önce kayıt olun.');
      }
    } catch (e) {
      console.error('Error reading user data:', e);
      Alert.alert('Giriş Hatası', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Başlık */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.logoEmoji}>💧</Text>
          <Text style={styles.title}>Tekrar Hoşgeldin!</Text>
          <Text style={styles.subtitle}>Hesabına giriş yap</Text>
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

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('RegisterPage')}
          >
            <Text style={styles.registerLinkText}>
              Hesabın yok mu? <Text style={styles.registerLinkHighlight}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alt alan */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Su içmeyi unutma! 🚰</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxl + spacing.lg,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
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
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.glow,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  registerLinkHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});

export default LoginPage;
