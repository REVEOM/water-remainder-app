# Water Reminder App - Photo Verification

A React Native/Expo app that reminds you to drink water. The only way to dismiss notifications is by taking a photo proving you drank water.

![Welcome Screen](/home/mami/.gemini/antigravity/brain/5a786241-0095-43ea-beb1-7c23fb712882/water_reminder_app_welcome_page_1766358852768.png)

## Features

- **Photo Verification** - Take a photo to prove you drank water and dismiss the reminder
- **Periodic Notifications** - Configurable reminders (30min, 1h, 2h, 3h intervals)
- **Progress Tracking** - Circular progress indicator showing daily water intake
- **Photo History** - View all your water drinking records with photos
- **Streak System** - Track consecutive days of meeting your water goal
- **Dark Theme** - Modern water-blue themed dark interface

## Tech Stack

- React Native with Expo
- expo-camera & expo-image-picker for photo capture
- expo-notifications for reminders
- expo-file-system for photo storage
- AsyncStorage for data persistence
- React Navigation for screen management

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd water-remainder-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

## Running the App

- **Mobile**: Scan the QR code with Expo Go app (Android/iOS)
- **Web**: Press `w` in terminal or visit `http://localhost:8081`
- **Android Emulator**: Press `a` in terminal

## Project Structure

```
water-remainder-app/
├── App.js                 # Main navigation and notification setup
├── theme.js               # Color palette and design tokens
├── components/
│   ├── WelcomePage.js     # Landing page with feature highlights
│   ├── RegisterPage.js    # User registration with weight-based goal
│   ├── LoginPage.js       # User authentication
│   ├── HomePage.js        # Main dashboard with progress circle
│   ├── PhotoVerificationModal.js  # Camera/gallery photo capture
│   ├── HistoryPage.js     # Past water intake records
│   └── SettingsPage.js    # Notification and account settings
└── services/
    └── NotificationService.js  # Notification scheduling and handling
```

## How It Works

1. Register with your weight to calculate daily water intake goal (30ml per kg)
2. Receive periodic notifications reminding you to drink water
3. Tap the notification or "Take Photo" button to open the camera
4. Take a photo of yourself drinking water
5. Select the amount (200ml, 250ml, 330ml, 500ml or custom)
6. Photo is saved and your progress updates

## Configuration

Water goal is automatically calculated based on your weight:
- **Formula**: Weight (kg) × 30 = Daily water goal (ml)
- **Example**: 70kg × 30 = 2100ml daily goal

Notification intervals can be adjusted in Settings:
- 30 minutes
- 1 hour (default)
- 2 hours
- 3 hours

## License

MIT
