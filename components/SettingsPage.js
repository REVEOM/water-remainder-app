import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';

const SettingsPage = ({ navigation }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notificationInterval, setNotificationInterval] = useState(60);
    const [userData, setUserData] = useState(null);

    const intervalOptions = [
        { label: '30 dk', value: 30 },
        { label: '1 saat', value: 60 },
        { label: '2 saat', value: 120 },
        { label: '3 saat', value: 180 },
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const status = await NotificationService.checkNotificationStatus();
            setNotificationsEnabled(status.isEnabled);

            const interval = await NotificationService.getNotificationInterval();
            setNotificationInterval(interval);

            const userDataJson = await AsyncStorage.getItem('@user_data');
            if (userDataJson) {
                setUserData(JSON.parse(userDataJson));
            }
        } catch (e) {
            console.error('Ayarlar yüklenemedi:', e);
        }
    };

    const handleNotificationToggle = async (value) => {
        setNotificationsEnabled(value);

        if (value) {
            await NotificationService.scheduleWaterReminder(notificationInterval);
        } else {
            await NotificationService.cancelAllNotifications();
        }
    };

    const handleIntervalChange = async (value) => {
        setNotificationInterval(value);

        if (notificationsEnabled) {
            await NotificationService.scheduleWaterReminder(value);
        }
    };

    const handleTestNotification = async () => {
        await NotificationService.sendTestNotification();
        Alert.alert('Test Bildirimi', '5 saniye içinde bir test bildirimi alacaksınız!');
    };

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        await NotificationService.cancelAllNotifications();
                        await AsyncStorage.removeItem('@is_logged_in');
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'WelcomePage' }],
                        });
                    },
                },
            ]
        );
    };

    const handleClearData = () => {
        Alert.alert(
            'Verileri Temizle',
            'Tüm su içme kayıtlarınız silinecek. Bu işlem geri alınamaz!',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Temizle',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('@water_records');
                        await AsyncStorage.removeItem('@streak_data');
                        Alert.alert('Başarılı', 'Tüm kayıtlar temizlendi.');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Başlık */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Ayarlar</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profil Kartı */}
                {userData && (
                    <View style={styles.profileCard}>
                        <View style={styles.profileAvatar}>
                            <Text style={styles.profileAvatarText}>
                                {userData.username?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{userData.username}</Text>
                            <Text style={styles.profileEmail}>{userData.email}</Text>
                        </View>
                    </View>
                )}

                {/* Bildirim Ayarları */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔔 Bildirimler</Text>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Su Hatırlatmaları</Text>
                            <Text style={styles.settingDesc}>Periyodik bildirimler al</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleNotificationToggle}
                            trackColor={{ true: colors.primary, false: colors.surfaceLight }}
                            thumbColor={colors.text}
                        />
                    </View>

                    <Text style={styles.intervalLabel}>Hatırlatma Aralığı</Text>
                    <View style={styles.intervalContainer}>
                        {intervalOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.intervalButton,
                                    notificationInterval === option.value && styles.intervalButtonActive,
                                ]}
                                onPress={() => handleIntervalChange(option.value)}
                            >
                                <Text style={[
                                    styles.intervalText,
                                    notificationInterval === option.value && styles.intervalTextActive,
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
                        <Text style={styles.testButtonText}>🧪 Test Bildirimi Gönder</Text>
                    </TouchableOpacity>
                </View>

                {/* Su Hedefi */}
                {userData && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💧 Su Hedefi</Text>
                        <View style={styles.goalCard}>
                            <Text style={styles.goalLabel}>Günlük Hedef</Text>
                            <Text style={styles.goalValue}>{userData.waterIntakeGoal} ml</Text>
                            <Text style={styles.goalDesc}>
                                ({userData.weight} kg × 30 ml)
                            </Text>
                        </View>
                    </View>
                )}

                {/* Uygulama */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚙️ Uygulama</Text>

                    <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
                        <Text style={styles.dangerButtonText}>🗑️ Tüm Kayıtları Temizle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>🚪 Çıkış Yap</Text>
                    </TouchableOpacity>
                </View>

                {/* Hakkında */}
                <View style={styles.aboutSection}>
                    <Text style={styles.aboutText}>Su Hatırlatıcı v1.0.0</Text>
                    <Text style={styles.aboutDesc}>Fotoğraflı doğrulama ile su içmeyi alışkanlık haline getir!</Text>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.xxl + spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    backButton: {
        fontSize: fontSize.xxl,
        color: colors.text,
        width: 40,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        ...shadows.sm,
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileAvatarText: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.background,
    },
    profileInfo: {
        marginLeft: spacing.md,
    },
    profileName: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    profileEmail: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    section: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        fontSize: fontSize.md,
        color: colors.text,
    },
    settingDesc: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    intervalLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    intervalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    intervalButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
    },
    intervalButtonActive: {
        backgroundColor: colors.primary,
    },
    intervalText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    intervalTextActive: {
        color: colors.background,
    },
    testButton: {
        backgroundColor: colors.surfaceLight,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    testButtonText: {
        fontSize: fontSize.sm,
        color: colors.text,
    },
    goalCard: {
        backgroundColor: colors.primary + '20',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary + '40',
    },
    goalLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    goalValue: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.primary,
        marginVertical: spacing.xs,
    },
    goalDesc: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
    },
    dangerButton: {
        backgroundColor: colors.error + '20',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.error + '40',
    },
    dangerButtonText: {
        fontSize: fontSize.md,
        color: colors.error,
    },
    logoutButton: {
        backgroundColor: colors.surfaceLight,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    logoutButtonText: {
        fontSize: fontSize.md,
        color: colors.text,
    },
    aboutSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    aboutText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    aboutDesc: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    bottomSpacer: {
        height: spacing.xxl,
    },
});

export default SettingsPage;
