import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';

const { width } = Dimensions.get('window');

const HistoryPage = ({ navigation }) => {
    const [records, setRecords] = useState([]);
    const [groupedRecords, setGroupedRecords] = useState({});
    const [totalStats, setTotalStats] = useState({ total: 0, photos: 0 });

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            const waterRecords = await AsyncStorage.getItem('@water_records');
            if (waterRecords) {
                const parsed = JSON.parse(waterRecords);
                // Tarihe göre sırala (en yeni üstte)
                const sorted = parsed.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                setRecords(sorted);

                // Günlere göre grupla
                const grouped = {};
                sorted.forEach(record => {
                    const date = new Date(record.timestamp).toDateString();
                    if (!grouped[date]) {
                        grouped[date] = [];
                    }
                    grouped[date].push(record);
                });
                setGroupedRecords(grouped);

                // İstatistikler
                const total = sorted.reduce((sum, r) => sum + r.amount, 0);
                const photos = sorted.filter(r => r.hasPhoto).length;
                setTotalStats({ total, photos });
            }
        } catch (e) {
            console.error('Kayıt yükleme hatası:', e);
        }
    };

    const deleteRecord = async (recordId) => {
        Alert.alert(
            'Kaydı Sil',
            'Bu kaydı silmek istediğine emin misin?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const record = records.find(r => r.id === recordId);

                            // Fotoğrafı sil
                            if (record?.photoUri) {
                                const fileInfo = await FileSystem.getInfoAsync(record.photoUri);
                                if (fileInfo.exists) {
                                    await FileSystem.deleteAsync(record.photoUri);
                                }
                            }

                            // Kaydı listeden kaldır
                            const updatedRecords = records.filter(r => r.id !== recordId);
                            await AsyncStorage.setItem('@water_records', JSON.stringify(updatedRecords));
                            loadRecords();
                        } catch (e) {
                            console.error('Silme hatası:', e);
                            Alert.alert('Hata', 'Kayıt silinemedi.');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Bugün';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Dün';
        } else {
            return date.toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            });
        }
    };

    const renderRecord = ({ item }) => (
        <TouchableOpacity
            style={styles.recordCard}
            onLongPress={() => deleteRecord(item.id)}
        >
            {item.photoUri && (
                <Image source={{ uri: item.photoUri }} style={styles.recordImage} />
            )}
            <View style={styles.recordInfo}>
                <View style={styles.recordHeader}>
                    <Text style={styles.recordTime}>
                        {new Date(item.timestamp).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                    {item.hasPhoto && <Text style={styles.photoIcon}>📸</Text>}
                </View>
                <Text style={styles.recordAmount}>{item.amount} ml</Text>
            </View>
        </TouchableOpacity>
    );

    const renderDateSection = ({ item: dateKey }) => {
        const dayRecords = groupedRecords[dateKey];
        const dayTotal = dayRecords.reduce((sum, r) => sum + r.amount, 0);

        return (
            <View style={styles.dateSection}>
                <View style={styles.dateHeader}>
                    <Text style={styles.dateText}>{formatDate(dateKey)}</Text>
                    <Text style={styles.dayTotal}>{dayTotal} ml</Text>
                </View>
                <View style={styles.recordsRow}>
                    {dayRecords.map((record) => (
                        <TouchableOpacity
                            key={record.id}
                            style={styles.miniRecordCard}
                            onLongPress={() => deleteRecord(record.id)}
                        >
                            {record.photoUri ? (
                                <Image source={{ uri: record.photoUri }} style={styles.miniImage} />
                            ) : (
                                <View style={styles.miniPlaceholder}>
                                    <Text style={styles.miniPlaceholderIcon}>💧</Text>
                                </View>
                            )}
                            <View style={styles.miniInfo}>
                                <Text style={styles.miniTime}>
                                    {new Date(record.timestamp).toLocaleTimeString('tr-TR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                                <Text style={styles.miniAmount}>{record.amount} ml</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Başlık */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Geçmiş Kayıtlar</Text>
                <View style={styles.placeholder} />
            </View>

            {/* İstatistikler */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{totalStats.total} ml</Text>
                    <Text style={styles.statLabel}>Toplam</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{totalStats.photos}</Text>
                    <Text style={styles.statLabel}>Fotoğraf</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Object.keys(groupedRecords).length}</Text>
                    <Text style={styles.statLabel}>Gün</Text>
                </View>
            </View>

            {/* Kayıtlar */}
            {Object.keys(groupedRecords).length > 0 ? (
                <FlatList
                    data={Object.keys(groupedRecords)}
                    keyExtractor={(item) => item}
                    renderItem={renderDateSection}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyTitle}>Henüz kayıt yok</Text>
                    <Text style={styles.emptyDesc}>Su içtiğinde fotoğraf çekerek kayıt oluştur!</Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate('PhotoVerification')}
                    >
                        <Text style={styles.emptyButtonText}>İlk Kaydı Oluştur 📸</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* İpucu */}
            {records.length > 0 && (
                <View style={styles.tipContainer}>
                    <Text style={styles.tipText}>💡 Silmek için kayda uzun bas</Text>
                </View>
            )}
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.surfaceLight,
    },
    listContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    dateSection: {
        marginBottom: spacing.xl,
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    dateText: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text,
        textTransform: 'capitalize',
    },
    dayTotal: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    recordsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    miniRecordCard: {
        width: (width - spacing.lg * 2 - spacing.sm * 2) / 3,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        ...shadows.sm,
    },
    miniImage: {
        width: '100%',
        height: 80,
        resizeMode: 'cover',
    },
    miniPlaceholder: {
        width: '100%',
        height: 80,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniPlaceholderIcon: {
        fontSize: 32,
    },
    miniInfo: {
        padding: spacing.sm,
        alignItems: 'center',
    },
    miniTime: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    miniAmount: {
        fontSize: fontSize.sm,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 2,
    },
    recordCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        overflow: 'hidden',
        ...shadows.sm,
    },
    recordImage: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
    },
    recordInfo: {
        flex: 1,
        padding: spacing.md,
        justifyContent: 'center',
    },
    recordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    recordTime: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    photoIcon: {
        marginLeft: spacing.sm,
        fontSize: 14,
    },
    recordAmount: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptyDesc: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    emptyButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
    },
    emptyButtonText: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.background,
    },
    tipContainer: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceLight,
    },
    tipText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
});

export default HistoryPage;
