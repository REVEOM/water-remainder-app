import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Bildirim işleyici ayarları
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    static isRegistered = false;
    static notificationListener = null;
    static responseListener = null;

    // Bildirim izinlerini al
    static async requestPermissions() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Bildirim izni verilmedi!');
            return false;
        }

        // Android için bildirim kanalı oluştur
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('water-reminders', {
                name: 'Su Hatırlatıcı',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4FC3F7',
                sound: 'default',
            });
        }

        this.isRegistered = true;
        return true;
    }

    // Su hatırlatma bildirimi planla
    static async scheduleWaterReminder(intervalMinutes = 60) {
        // Mevcut bildirimleri iptal et
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Rastgele motivasyonel mesajlar
        const messages = [
            { title: '💧 Su İçme Zamanı!', body: 'Sağlıklı kalmak için bir bardak su iç!' },
            { title: '🚰 Hey!', body: 'Vücudun suya ihtiyaç duyuyor. Şimdi iç!' },
            { title: '💪 Unutma!', body: 'Su içmek enerjini artırır. Hadi bir yudum!' },
            { title: '🌊 Su Molası!', body: 'Beynin %75 su. Beslemeyi unutma!' },
            { title: '❤️ Sağlık Hatırlatması', body: 'Günlük su hedefinize ulaşın!' },
            { title: '🎯 Hedefine Yaklaş!', body: 'Bir bardak su ile hedefe bir adım daha!' },
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // Tekrarlayan bildirim planla
        await Notifications.scheduleNotificationAsync({
            content: {
                title: randomMessage.title,
                body: randomMessage.body,
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: {
                    type: 'water_reminder',
                    requiresPhoto: true,
                },
            },
            trigger: {
                seconds: intervalMinutes * 60,
                repeats: true,
                channelId: 'water-reminders',
            },
        });

        // Ayarları kaydet
        await AsyncStorage.setItem('@notification_interval', intervalMinutes.toString());
        console.log(`Su hatırlatması ${intervalMinutes} dakikada bir planlandı.`);
    }

    // Hızlı test bildirimi (5 saniye sonra)
    static async sendTestNotification() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '💧 Test Bildirimi',
                body: 'Bildirimler çalışıyor! Su içmeyi unutma!',
                sound: 'default',
                data: {
                    type: 'water_reminder',
                    requiresPhoto: true,
                },
            },
            trigger: {
                seconds: 5,
                channelId: 'water-reminders',
            },
        });
    }

    // Anlık bildirim gönder
    static async sendImmediateNotification(title, body) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: 'default',
            },
            trigger: null, // Hemen gönder
        });
    }

    // Bildirimleri dinle (navigation ile)
    static setupListeners(navigation) {
        // Bildirim geldiğinde (uygulama açıkken)
        this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Bildirim alındı:', notification);
        });

        // Bildirime tıklandığında
        this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;

            if (data?.type === 'water_reminder' && data?.requiresPhoto) {
                // Fotoğraf doğrulama sayfasına yönlendir
                navigation.navigate('PhotoVerification');
            }
        });
    }

    // Dinleyicileri temizle
    static removeListeners() {
        if (this.notificationListener) {
            Notifications.removeNotificationSubscription(this.notificationListener);
        }
        if (this.responseListener) {
            Notifications.removeNotificationSubscription(this.responseListener);
        }
    }

    // Tüm bildirimleri iptal et
    static async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    // Günlük hedefe ulaşıldığında bildirim
    static async sendGoalAchievedNotification() {
        await this.sendImmediateNotification(
            '🎉 Tebrikler!',
            'Günlük su hedefinize ulaştınız! Harika iş çıkardınız!'
        );
        // Gün boyunca hatırlatma gönderme
        await this.cancelAllNotifications();
    }

    // Kayıtlı bildirim aralığını al
    static async getNotificationInterval() {
        const interval = await AsyncStorage.getItem('@notification_interval');
        return interval ? parseInt(interval) : 60; // Varsayılan 60 dakika
    }

    // Bildirimlerin durumunu kontrol et
    static async checkNotificationStatus() {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        return {
            isEnabled: scheduled.length > 0,
            count: scheduled.length,
            notifications: scheduled,
        };
    }
}

export default NotificationService;
