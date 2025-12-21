import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Dimensions,
    TextInput,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';

const { width, height } = Dimensions.get('window');

const PhotoVerificationModal = ({ navigation, route }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState(null);
    const [waterAmount, setWaterAmount] = useState(route?.params?.suggestedAmount?.toString() || '250');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const cameraRef = useRef(null);
    const successAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Hızlı miktar seçenekleri
    const quickAmounts = [200, 250, 330, 500];

    useEffect(() => {
        // Buton animasyonu
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.permissionText}>Kamera izni kontrol ediliyor...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionCard}>
                    <Text style={styles.permissionIcon}>📸</Text>
                    <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
                    <Text style={styles.permissionDesc}>
                        Su içtiğini kanıtlamak için fotoğraf çekmen gerekiyor!
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>İzin Ver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.secondaryButtonText}>Vazgeç</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: false,
                });
                setCapturedImage(photo.uri);
            } catch (error) {
                console.error('Fotoğraf çekme hatası:', error);
                Alert.alert('Hata', 'Fotoğraf çekilemedi. Lütfen tekrar dene.');
            }
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setCapturedImage(result.assets[0].uri);
        }
    };

    const saveRecord = async () => {
        if (!capturedImage) {
            Alert.alert('Uyarı', 'Önce bir fotoğraf çek veya seç!');
            return;
        }

        const amount = parseInt(waterAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Uyarı', 'Geçerli bir su miktarı gir!');
            return;
        }

        setIsSaving(true);

        try {
            // Fotoğrafı kaydet
            const fileName = `water_${Date.now()}.jpg`;
            const newPath = `${FileSystem.documentDirectory}photos/${fileName}`;

            // Klasör yoksa oluştur
            const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}photos`);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}photos`, { intermediates: true });
            }

            await FileSystem.copyAsync({
                from: capturedImage,
                to: newPath,
            });

            // Kayıt oluştur
            const record = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                amount: amount,
                photoUri: newPath,
                hasPhoto: true,
            };

            // Mevcut kayıtları al ve güncelle
            const existingRecords = await AsyncStorage.getItem('@water_records');
            const records = existingRecords ? JSON.parse(existingRecords) : [];
            records.push(record);
            await AsyncStorage.setItem('@water_records', JSON.stringify(records));

            // Streak güncelle
            await updateStreak();

            // Başarı animasyonu
            setShowSuccess(true);
            Animated.timing(successAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            // Bildirimi iptal et (varsa)
            // PushNotification.cancelAllLocalNotifications();

            setTimeout(() => {
                navigation.navigate('Home', { refreshData: true });
            }, 1500);

        } catch (error) {
            console.error('Kayıt hatası:', error);
            Alert.alert('Hata', 'Kayıt oluşturulamadı. Lütfen tekrar dene.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateStreak = async () => {
        try {
            const streakData = await AsyncStorage.getItem('@streak_data');
            const streak = streakData ? JSON.parse(streakData) : { count: 0, lastDate: null };

            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();

            if (streak.lastDate === today) {
                // Bugün zaten kayıt var
                return;
            } else if (streak.lastDate === yesterday) {
                // Dün kayıt vardı, streak devam
                streak.count += 1;
            } else {
                // Streak kırıldı
                streak.count = 1;
            }

            streak.lastDate = today;
            await AsyncStorage.setItem('@streak_data', JSON.stringify(streak));
        } catch (error) {
            console.error('Streak güncelleme hatası:', error);
        }
    };

    if (showSuccess) {
        return (
            <View style={styles.successContainer}>
                <Animated.View style={[
                    styles.successContent,
                    {
                        opacity: successAnim,
                        transform: [{
                            scale: successAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                            }),
                        }],
                    },
                ]}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successTitle}>Harika!</Text>
                    <Text style={styles.successAmount}>{waterAmount} ml kaydedildi</Text>
                    <Text style={styles.successMessage}>Sağlıklı kalmaya devam et! 💪</Text>
                </Animated.View>
            </View>
        );
    }

    if (capturedImage) {
        return (
            <View style={styles.container}>
                {/* Önizleme */}
                <View style={styles.previewContainer}>
                    <Image source={{ uri: capturedImage }} style={styles.previewImage} />

                    {/* Geri tuşu */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setCapturedImage(null)}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                </View>

                {/* Alt kısım */}
                <View style={styles.bottomSection}>
                    <Text style={styles.amountLabel}>Ne kadar su içtin?</Text>

                    {/* Hızlı seçimler */}
                    <View style={styles.quickAmountContainer}>
                        {quickAmounts.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[
                                    styles.quickAmountButton,
                                    waterAmount === amount.toString() && styles.quickAmountButtonActive,
                                ]}
                                onPress={() => setWaterAmount(amount.toString())}
                            >
                                <Text style={[
                                    styles.quickAmountText,
                                    waterAmount === amount.toString() && styles.quickAmountTextActive,
                                ]}>
                                    {amount} ml
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Manuel giriş */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.amountInput}
                            value={waterAmount}
                            onChangeText={setWaterAmount}
                            keyboardType="numeric"
                            placeholder="Miktar"
                            placeholderTextColor={colors.textMuted}
                        />
                        <Text style={styles.mlText}>ml</Text>
                    </View>

                    {/* Butonlar */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.retakeButton}
                            onPress={() => setCapturedImage(null)}
                        >
                            <Text style={styles.retakeButtonText}>Tekrar Çek</Text>
                        </TouchableOpacity>

                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={saveRecord}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color={colors.background} />
                                ) : (
                                    <Text style={styles.saveButtonText}>Kaydet ✓</Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Kamera */}
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
            >
                {/* Üst kısım */}
                <View style={styles.cameraTopOverlay}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.cameraTitle}>Su içtiğini göster! 📸</Text>
                </View>

                {/* Çerçeve */}
                <View style={styles.cameraFrame}>
                    <View style={styles.cornerTL} />
                    <View style={styles.cornerTR} />
                    <View style={styles.cornerBL} />
                    <View style={styles.cornerBR} />
                </View>

                {/* Alt kısım */}
                <View style={styles.cameraBottomOverlay}>
                    <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                        <Text style={styles.galleryIcon}>🖼️</Text>
                        <Text style={styles.galleryText}>Galeri</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>

                    <View style={styles.placeholderButton} />
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    // İzin ekranı stilleri
    permissionCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        margin: spacing.lg,
        alignItems: 'center',
        ...shadows.lg,
    },
    permissionIcon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    permissionTitle: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    permissionDesc: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    permissionButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    permissionButtonText: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.background,
    },
    permissionText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    secondaryButton: {
        padding: spacing.md,
    },
    secondaryButtonText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    // Kamera stilleri
    camera: {
        flex: 1,
    },
    cameraTopOverlay: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing.xxl + spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: fontSize.xl,
        color: colors.text,
    },
    cameraTitle: {
        flex: 1,
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginRight: 44,
    },
    cameraFrame: {
        flex: 1,
        margin: spacing.xxl,
    },
    cornerTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderColor: colors.primary,
        borderTopLeftRadius: borderRadius.md,
    },
    cornerTR: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderColor: colors.primary,
        borderTopRightRadius: borderRadius.md,
    },
    cornerBL: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderColor: colors.primary,
        borderBottomLeftRadius: borderRadius.md,
    },
    cornerBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: colors.primary,
        borderBottomRightRadius: borderRadius.md,
    },
    cameraBottomOverlay: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
    },
    galleryButton: {
        alignItems: 'center',
        width: 70,
    },
    galleryIcon: {
        fontSize: 28,
    },
    galleryText: {
        fontSize: fontSize.xs,
        color: colors.text,
        marginTop: spacing.xs,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: colors.text,
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.text,
    },
    placeholderButton: {
        width: 70,
    },
    // Önizleme stilleri
    previewContainer: {
        flex: 1,
    },
    previewImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute',
        top: spacing.xxl + spacing.lg,
        left: spacing.lg,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: fontSize.xl,
        color: colors.text,
    },
    bottomSection: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.lg,
    },
    amountLabel: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    quickAmountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    quickAmountButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
    },
    quickAmountButtonActive: {
        backgroundColor: colors.primary,
    },
    quickAmountText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    quickAmountTextActive: {
        color: colors.background,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    amountInput: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        width: 100,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        paddingVertical: spacing.sm,
    },
    mlText: {
        fontSize: fontSize.lg,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    retakeButton: {
        flex: 1,
        paddingVertical: spacing.md,
        marginRight: spacing.sm,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.textSecondary,
        alignItems: 'center',
    },
    retakeButtonText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.success,
        alignItems: 'center',
        minWidth: 150,
        ...shadows.glow,
    },
    saveButtonText: {
        fontSize: fontSize.md,
        color: colors.text,
        fontWeight: 'bold',
    },
    // Başarı ekranı
    successContainer: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successContent: {
        alignItems: 'center',
    },
    successIcon: {
        fontSize: 80,
        marginBottom: spacing.lg,
    },
    successTitle: {
        fontSize: fontSize.hero,
        fontWeight: 'bold',
        color: colors.success,
        marginBottom: spacing.sm,
    },
    successAmount: {
        fontSize: fontSize.xl,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    successMessage: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
});

export default PhotoVerificationModal;
