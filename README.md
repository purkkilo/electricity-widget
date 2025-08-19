# ⚡ Electricity Widget

> **A React Native app for tracking real-time electricity prices in Finland**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-53.0.18-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green.svg)](https://jestjs.io/)

This app displays current and upcoming electricity prices in Finland with color-coded pricing tiers. Built with Expo and React Native, it features real-time price tracking, customizable price alerts, and a clean, intuitive interface.

## 📱 Features

- 🔴 **Real-time price tracking** - Current hourly electricity prices
- 📊 **Price history** - View yesterday, today, and tomorrow's prices
- ⚙️ **Customizable limits** - Set your own price thresholds
- 📱 **Cross-platform** - Android, and Web support (iOS not tested)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (optional, for additional features)

### Installation

```bash
# Clone the repository
git clone https://github.com/purkkilo/electricity-widget.git

cd electricity-widget

# Install dependencies
npm install
```

### Running the App

```bash
# Start the development server
npm start
```

In the output, you'll find options to open the app in:

- 🔧 **[Development build](https://docs.expo.dev/develop/development-builds/introduction/)** - Full native features
- 🤖 **[Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)** - Android development
- 📱 **[iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)** - iOS development
- 📦 **[Expo Go](https://expo.dev/go)** - Quick preview (limited features)

### Platform-Specific Commands

```bash
# Run on specific platforms
npm run android    # Android
npm run ios        # iOS
npm run web        # Web browser
```

## 🧪 Testing

> **Note**: The comprehensive test suite was generated using AI assistance while exploring modern development workflows with Warp terminal and AI-powered coding tools.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run API tests specifically
node scripts/test-api.js --coverage

# Watch mode for development
npm test -- --watch
```

### Test Coverage

The project includes comprehensive tests for:

- ✅ **API layer** - HTTP requests, error handling, data validation
- ✅ **Utility functions** - Date formatting, price calculations
- ✅ **Integration tests** - End-to-end API workflows
- 📊 **100% coverage** for critical API and utility functions

## 🔧 Development

### Project Structure

```
electricity-widget/
├── app/                    # File-based routing (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── utils/                 # Utility functions
│   ├── api.ts            # API layer
│   ├── format.ts         # Date/time formatting
│   └── manageStorage.ts  # Local storage
├── constants/             # App constants
├── __tests__/            # Test files
└── scripts/              # Build and utility scripts
```

### Key Technologies

- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based navigation
- **[Luxon](https://moment.github.io/luxon/)** - Date/time handling (Finland timezone)
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Local data caching
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** - Smooth animations

## 📊 Data Source

Electricity price data is sourced from [sahkonhintatanaan.fi](https://www.sahkonhintatanaan.fi), which provides:

- Hourly electricity prices for Finland
- Next-day price updates (available after 14:00 Helsinki time)
- Historical price data
- Tax-inclusive pricing (25.5% VAT)

## 🙏 Acknowledgments

- **Data Source**: [sahkonhintatanaan.fi](https://www.sahkonhintatanaan.fi)
- **Icons**: [Flaticon](https://www.flaticon.com/free-icons/thunder) (Thunder icons by Freepik)
- **Framework**: [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- **AI Tools**: [Warp](https://warp.dev)
