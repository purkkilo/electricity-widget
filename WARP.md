# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an Expo React Native application that displays electricity prices in Finland. The app fetches real-time electricity pricing data from sahkonhintatanaan.fi API and presents it with color-coded price ranges. The app is built using Expo SDK 53 with the new architecture enabled and uses file-based routing via Expo Router.

## Common Development Commands

### Start Development
```bash
npx expo start
```

### Platform-specific builds
```bash
# Android
npx expo run:android

# iOS  
npx expo run:ios

# Web
npx expo start --web
```

### Testing and Code Quality
```bash
# Run tests in watch mode
npm test

# Lint code
npm run lint
```

### Package Management
```bash
# Install dependencies
npm install

# Clear Expo cache (useful for troubleshooting)
npx expo install --fix
```

## Architecture Overview

### Routing Structure
- **File-based routing** using Expo Router
- **Root Layout** (`app/_layout.tsx`): Theme provider, font loading, splash screen management
- **Tab Layout** (`app/(tabs)/_layout.tsx`): Bottom tab navigation with haptic feedback
- **Main Screens**:
  - `index.tsx`: Home screen displaying electricity prices and credits
  - `settings.tsx`: Settings screen for configuring price limits

### Core Components
- **ElectricityList** (`components/ElectricityList.tsx`): Main component handling price data fetching, caching, and display with tab-based day navigation
- **SettingsPanel** (`components/SettingsPanel.tsx`): User interface for setting medium/high price limits that affect color coding
- **BaseLayout** (`components/BaseLayout.tsx`): Common layout wrapper
- **Themed Components**: `ThemedText`, `ThemedView` for consistent styling across light/dark modes

### Data Management
- **API Layer** (`utils/api.ts`): Handles fetching from sahkonhintatanaan.fi API
- **Storage** (`utils/manageStorage.ts`): AsyncStorage wrapper for caching prices and user settings
- **Data Flow**: 
  - Prices are fetched daily and cached locally
  - Tomorrow's prices become available after 14:00 Helsinki time (UTC+3)
  - Color coding based on user-configurable limits (default: medium=10, high=20 c/kWh)

### Key Utilities
- **Time Management** (`utils/utils.ts`): 
  - Luxon DateTime configured for Finland timezone (Europe/Helsinki)
  - Price updates, hour changes, and midnight transitions
  - Price calculations with 25.5% tax included
- **Format** (`utils/format.ts`): Date and time formatting helpers
- **Color Logic**: Dynamic color coding based on price thresholds (green for negative, neon for low, yellow for medium, red for high)

### Configuration
- **TypeScript** with strict mode enabled
- **Path aliases**: `@/*` points to project root
- **Timezone**: Hardcoded to Finland (Europe/Helsinki, fi-FI locale)
- **Price Display**: Includes 25.5% tax, rounded to 2 decimal places
- **Data Source**: sahkonhintatanaan.fi API with automatic fallback for missing data

### State Management Patterns
- **Local Component State**: React hooks for UI state and real-time updates
- **Persistent Storage**: AsyncStorage for price caching and user preferences  
- **Interval Management**: Multiple timers for minute updates, hour changes, midnight transitions, and daily price fetches
- **Loading States**: Separate loading indicators for today/yesterday/tomorrow price data

### Platform Considerations
- **Cross-platform**: iOS, Android, and Web support
- **Native Features**: Haptic feedback on iOS, ToastAndroid notifications
- **Performance**: Price data caching prevents unnecessary API calls
- **Accessibility**: Proper semantic elements and color contrast considerations

## Testing

The project includes comprehensive AI-generated tests as part of exploring modern development workflows:

```bash
# Run all tests
npm test

# Run API tests with coverage
node scripts/test-api.js --coverage

# Test specific patterns
npx jest --testPathPattern="api|format" --coverage
```

**Test Coverage**:
- ✅ API layer (100% coverage)
- ✅ Format utilities (100% coverage) 
- ✅ Integration tests
- ✅ Error handling scenarios
- ✅ Edge cases and timezone handling

## Development Notes

- **API Behavior**: Tomorrow's electricity prices become available after 14:00 Helsinki time
- **Price Updates**: Automatic refetch logic based on time and data availability
- **Error Handling**: Graceful fallback to "Data Not Available" when API fails
- **Console Warnings**: Custom warning suppression for known React Navigation and Expo deprecation warnings
- **Storage Keys**: `prices-today`, `prices-yesterday`, `prices-tomorrow`, `mLimit`, `hLimit`, `electricityPrice`
- **AI Development**: Tests and documentation generated using AI assistance with Warp terminal
