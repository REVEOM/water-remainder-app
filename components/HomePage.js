import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';

const { width } = Dimensions.get('window');

const HomePage = ({ navigation }) => {
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterGoal, setWaterGoal] = useState(2000); // ml cinsinden
    const [todayRecords, setTodayRecords] = useState([]);
    const [streak, setStreak] = useState(0);

    // Animasyonlar
    const progressAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const waterWaveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadUserData();
        startAnimations();
    }, []);

    useEffect(() => {
        // İlerleme animasyonu
        const progress = Math.min(waterIntake / waterGoal, 1);
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [waterIntake, waterGoal]);

    const startAnimations = () => {
        // Nabız animasyonu
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Su dalgası animasyonu
        Animated.loop(
            Animated.timing(waterWaveAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();
    };

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('@user_data');
            const waterRecords = await AsyncStorage.getItem('@water_records');
            const streakData = await AsyncStorage.getItem('@streak_data');

            if (userData) {
                const parsed = JSON.parse(userData);
                // Kilo bazlı hedef hesaplama (30ml per kg)
                const goal = (parsed.weight || 70) * 30;
                setWaterGoal(goal);
            }

            if (waterRecords) {
                const records = JSON.parse(waterRecords);
                const today = new Date().toDateString();
                const todayRecs = records.filter(r => new Date(r.timestamp).toDateString() === today);
                setTodayRecords(todayRecs);

                // Bugünkü toplam
                const totalToday = todayRecs.reduce((sum, r) => sum + r.amount, 0);
                setWaterIntake(totalToday);
            }

            if (streakData) {
                setStreak(JSON.parse(streakData).count || 0);
            }
        } catch (e) {
            console.error('Veri yükleme hatası:', e);
        }
    };

    const handleAddWater = () => {
        // Fotoğraf doğrulama modalına yönlendir
        navigation.navigate('PhotoVerification');
    };

    const progress = Math.min(waterIntake / waterGoal, 1);
    const percentage = Math.round(progress * 100);
    const remaining = Math.max(waterGoal - waterIntake, 0);

    // Dairesel ilerleme hesaplaması
    const circleSize = width * 0.6;
    const strokeWidth = 15;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const animatedStrokeDashoffset = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Başlık */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Merhaba! 💧</Text>
                    <Text style={styles.date}>{new Date().toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    })}</Text>
                </View>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* Ana İlerleme Kartı */}
            <Animated.View style={[styles.progressCard, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.circleContainer}>
                    {/* Arka plan dairesi */}
                    <View style={[styles.circle, { width: circleSize, height: circleSize }]}>
                        <View style={styles.circleBackground} />

                        {/* Su dalgası efekti */}
                        <View style={[styles.waterFill, { height: `${percentage}%` }]} />

                        {/* İlerleme metni */}
                        <View style={styles.circleContent}>
                            <Text style={styles.percentageText}>{percentage}%</Text>
                            <Text style={styles.intakeText}>{waterIntake} ml</Text>
                            <Text style={styles.goalText}>/ {waterGoal} ml</Text>
                        </View>
                    </View>
                </View>

                {/* Kalan miktar */}
                <View style={styles.remainingContainer}>
                    {remaining > 0 ? (
                        <Text style={styles.remainingText}>
                            Hedefe <Text style={styles.remainingHighlight}>{remaining} ml</Text> kaldı
                        </Text>
                    ) : (
                        <Text style={styles.completedText}>🎉 Günlük hedefe ulaştın!</Text>
                    )}
                </View>
            </Animated.View>

            {/* İstatistikler */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🔥</Text>
                    <Text style={styles.statValue}>{streak}</Text>
                    <Text style={styles.statLabel}>Gün Seri</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>📸</Text>
                    <Text style={styles.statValue}>{todayRecords.length}</Text>
                    <Text style={styles.statLabel}>Bugün</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>💧</Text>
                    <Text style={styles.statValue}>{Math.round(waterIntake / 250)}</Text>
                    <Text style={styles.statLabel}>Bardak</Text>
                </View>
            </View>

            {/* Su İç Butonu */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddWater}>
                <View style={styles.addButtonGradient}>
                    <Text style={styles.addButtonIcon}>📸</Text>
                    <Text style={styles.addButtonText}>Su İçtim - Fotoğraf Çek</Text>
                </View>
            </TouchableOpacity>

            {/* Hızlı Ekleme Butonları */}
            <View style={styles.quickAddContainer}>
                <Text style={styles.quickAddTitle}>Hızlı Ekle</Text>
                <View style={styles.quickAddButtons}>
                    {[200, 250, 330, 500].map((amount) => (
                        <TouchableOpacity
                            key={amount}
                            style={styles.quickAddButton}
                            onPress={() => navigation.navigate('PhotoVerification', { suggestedAmount: amount })}
                        >
                            <Text style={styles.quickAddEmoji}>
                                {amount <= 250 ? '🥤' : amount <= 330 ? '🫗' : '🍶'}
                            </Text>
                            <Text style={styles.quickAddAmount}>{amount} ml</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Geçmiş Önizleme */}
            {todayRecords.length > 0 && (
                <View style={styles.historyPreview}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Bugünkü Kayıtlar</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('History')}>
                            <Text style={styles.seeAllText}>Tümünü Gör →</Text>
                        </TouchableOpacity>
                    </View>

                    {todayRecords.slice(-3).reverse().map((record, index) => (
                        <View key={index} style={styles.historyItem}>
                            <View style={styles.historyItemLeft}>
                                <Text style={styles.historyTime}>
                                    {new Date(record.timestamp).toLocaleTimeString('tr-TR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                                <Text style={styles.historyAmount}>{record.amount} ml</Text>
                            </View>
                            {record.hasPhoto && <Text style={styles.historyPhoto}>📸</Text>}
                        </View>
                    ))}
                </View>
            )}

            {/* Alt boşluk */}
            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingTop: spacing.xxl + spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    settingsIcon: {
        fontSize: 22,
    },
    greeting: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    date: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textTransform: 'capitalize',
    },
    progressCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        ...shadows.lg,
    },
    circleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        borderRadius: 999,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: colors.primary,
    },
    circleBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.surfaceLight,
    },
    waterFill: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.primary + '40',
        borderBottomLeftRadius: 999,
        borderBottomRightRadius: 999,
    },
    circleContent: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    percentageText: {
        fontSize: fontSize.hero,
        fontWeight: 'bold',
        color: colors.text,
    },
    intakeText: {
        fontSize: fontSize.xl,
        fontWeight: '600',
        color: colors.primary,
        marginTop: spacing.xs,
    },
    goalText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    remainingContainer: {
        marginTop: spacing.lg,
    },
    remainingText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    remainingHighlight: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    completedText: {
        fontSize: fontSize.lg,
        color: colors.success,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        ...shadows.sm,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    addButton: {
        marginTop: spacing.xl,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.glow,
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },
    addButtonIcon: {
        fontSize: 24,
        marginRight: spacing.sm,
    },
    addButtonText: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.background,
    },
    quickAddContainer: {
        marginTop: spacing.xl,
    },
    quickAddTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    quickAddButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickAddButton: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        ...shadows.sm,
    },
    quickAddEmoji: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    quickAddAmount: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    historyPreview: {
        marginTop: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.sm,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    historyTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
    },
    seeAllText: {
        fontSize: fontSize.sm,
        color: colors.primary,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceLight,
    },
    historyItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyTime: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginRight: spacing.md,
        width: 50,
    },
    historyAmount: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
    },
    historyPhoto: {
        fontSize: 18,
    },
    bottomSpacer: {
        height: spacing.xxl,
    },
});

export default HomePage;
