// 💧 Su Hatırlatma Uygulaması - Tema
export const colors = {
    // Ana Renkler
    primary: '#4FC3F7',        // Açık su mavisi
    primaryDark: '#0288D1',    // Koyu mavi
    primaryLight: '#81D4FA',   // Çok açık mavi

    // Arka Plan
    background: '#0A1929',     // Koyu lacivert
    surface: '#132F4C',        // Kart arka planı
    surfaceLight: '#1E3A5F',   // Açık kart

    // Metin
    text: '#FFFFFF',
    textSecondary: '#B0BEC5',
    textMuted: '#78909C',

    // Durum Renkleri
    success: '#4CAF50',
    successLight: '#81C784',
    warning: '#FFC107',
    error: '#EF5350',

    // Degrade
    gradientStart: '#4FC3F7',
    gradientEnd: '#0288D1',

    // Su Animasyonu
    water: '#2196F3',
    waterLight: '#64B5F6',
    waterDark: '#1976D2',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
};

export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 48,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: {
        shadowColor: '#4FC3F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
};
