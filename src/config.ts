import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator, localhost for iOS simulator
export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
