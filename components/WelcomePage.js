import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';

const { width } = Dimensions.get('window');

const WelcomePage = ({ navigation }) => {
  const handleStart = () => {
    navigation.navigate('RegisterPage');
  };

  return (
    <View style={styles.container}>
      {/* Su animasyonu arka planı */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      <View style={styles.backgroundCircle3} />

      {/* İçerik */}
      <View style={styles.content}>
        {/* Logo ve başlık */}
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>💧</Text>
          <Text style={styles.title}>Su Hatırlatıcı</Text>
          <Text style={styles.subtitle}>Fotoğraflı Doğrulama</Text>
        </View>

        {/* Açıklama kartları */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureTitle}>Fotoğraf Çek</Text>
            <Text style={styles.featureDesc}>Su içtiğini kanıtla</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔔</Text>
            <Text style={styles.featureTitle}>Hatırlatma</Text>
            <Text style={styles.featureDesc}>Düzenli bildirimler</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Takip Et</Text>
            <Text style={styles.featureDesc}>İlerlемени gör</Text>
          </View>
        </View>

        {/* Açıklama metni */}
        <Text style={styles.description}>
          Bildirimi kapatmanın tek yolu{'\n'}
          <Text style={styles.highlight}>fotoğraf kanıtı</Text> sunmak!
        </Text>
      </View>

      {/* Başla butonu */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Hadi Başlayalım</Text>
          <Text style={styles.startButtonArrow}>→</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Arka plan süslemeleri
  backgroundCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary + '15',
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryDark + '10',
  },
  backgroundCircle3: {
    position: 'absolute',
    top: '40%',
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight + '20',
  },
  content: {
    flex: 1,
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    ...shadows.sm,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  highlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  bottomSection: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  startButtonText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.background,
  },
  startButtonArrow: {
    fontSize: fontSize.xl,
    color: colors.background,
    marginLeft: spacing.sm,
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

export default WelcomePage;
