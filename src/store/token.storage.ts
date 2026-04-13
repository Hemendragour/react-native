// token.storage.ts
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface UserData {
    userId: string;
    email: string;
    role: string;
}

interface TokenData {
    accessToken: string;
    refreshToken: string;
    expiresIn: string | number;
}

// ─────────────────────────────────────────────
// Memory Cache
//
// Kyun chahiye:
// axios interceptor synchronous hota hai — wahan
// await nahi kar sakte. isliye SecureStore se load
// hone ke baad tokens memory mein bhi rakhte hain
// taaki interceptor seedha cache se padh sake.
// ─────────────────────────────────────────────
let _cache: {
    accessToken:  string | null;
    refreshToken: string | null;
    userData:     UserData | null;
    tokenExpiry:  number | null;
} = {
    accessToken:  null,
    refreshToken: null,
    userData:     null,
    tokenExpiry:  null,
};

// ─────────────────────────────────────────────
// Keys
// ─────────────────────────────────────────────
const KEYS = {
    ACCESS_TOKEN:  'throne8_access_token',
    REFRESH_TOKEN: 'throne8_refresh_token',
    USER_DATA:     'throne8_user_data',
    TOKEN_EXPIRY:  'throne8_token_expiry',
} as const;

// ─────────────────────────────────────────────
// Helper — expiry minutes calculate karo
// ─────────────────────────────────────────────
function calcExpiryTime(expiresIn: string | number): number {
    let minutes: number;
    if (typeof expiresIn === 'string') {
        minutes = parseInt(expiresIn.replace(/\D/g, '')) || 15;
    } else {
        minutes = Math.floor(expiresIn / 60) || 15;
    }
    return Date.now() + minutes * 60 * 1000;
}

// ─────────────────────────────────────────────
// TokenStorage
// ─────────────────────────────────────────────
class TokenStorage {

    // ══════════════════════════════════════════
    // INIT — app start pe ek baar call karo
    // ye SecureStore se memory cache mein load karta hai
    // ══════════════════════════════════════════
    static async init(): Promise<void> {
        try {
            const [accessToken, refreshToken, userDataStr, expiryStr] = await Promise.all([
                Keychain.getGenericPassword({ service: KEYS.ACCESS_TOKEN }),
                Keychain.getGenericPassword({ service: KEYS.REFRESH_TOKEN }),
                AsyncStorage.getItem(KEYS.USER_DATA),
                AsyncStorage.getItem(KEYS.TOKEN_EXPIRY),
            ]);

            _cache.accessToken  = accessToken ? accessToken.password : null;
            _cache.refreshToken = refreshToken ? refreshToken.password : null;
            _cache.userData     = userDataStr ? JSON.parse(userDataStr) : null;
            _cache.tokenExpiry  = expiryStr ? parseInt(expiryStr) : null;

            console.log('✅ [TokenStorage] Initialized from SecureStore', {
                hasAccessToken:  !!accessToken,
                hasRefreshToken: !!refreshToken,
                hasUserData:     !!userDataStr,
            });
        } catch (error) {
            console.error('❌ [TokenStorage] Init failed:', error);
        }
    }

    // ══════════════════════════════════════════
    // SET — login/register ke baad call karo
    // ══════════════════════════════════════════
    static async setAuthData(tokens: TokenData, user: UserData): Promise<void> {
        try {
            const expiryTime = calcExpiryTime(tokens.expiresIn);

            // SecureStore mein save karo (persist)
            await Promise.all([
                Keychain.setGenericPassword(KEYS.ACCESS_TOKEN,  tokens.accessToken),
                Keychain.setGenericPassword(KEYS.REFRESH_TOKEN, tokens.refreshToken),
                Keychain.setGenericPassword(KEYS.USER_DATA,     JSON.stringify(user)),
                Keychain.setGenericPassword(KEYS.TOKEN_EXPIRY,  expiryTime.toString()),
            ]);

            // Memory cache update karo (sync access ke liye)
            _cache.accessToken  = tokens.accessToken;
            _cache.refreshToken = tokens.refreshToken;
            _cache.userData     = user;
            _cache.tokenExpiry  = expiryTime;

            console.log('✅ [TokenStorage] Auth data stored', {
                userId:     user.userId,
                expiresIn:  tokens.expiresIn,
                expiryTime: new Date(expiryTime).toLocaleString(),
            });
        } catch (error) {
            console.error('❌ [TokenStorage] Failed to store auth data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    // ══════════════════════════════════════════
    // GET (sync — memory cache se)
    // axios interceptor yahi use karta hai
    // ══════════════════════════════════════════
    static getAccessToken(): string | null {
        if (!_cache.accessToken) {
            console.log('ℹ️ [TokenStorage] No access token in cache');
            return null;
        }
        if (this.isTokenExpired()) {
            console.warn('⚠️ [TokenStorage] Access token expired');
            return null;
        }
        return _cache.accessToken;
    }

    static getRefreshToken(): string | null {
        if (!_cache.refreshToken) {
            console.log('ℹ️ [TokenStorage] No refresh token in cache');
        }
        return _cache.refreshToken;
    }

    static getUserData(): UserData | null {
        return _cache.userData;
    }

    // ══════════════════════════════════════════
    // TOKEN EXPIRY CHECK (sync)
    // ══════════════════════════════════════════
    static isTokenExpired(): boolean {
        if (!_cache.tokenExpiry) return true;
        const expired = Date.now() >= _cache.tokenExpiry;
        if (expired) console.warn('⚠️ [TokenStorage] Token has expired');
        return expired;
    }

    // ══════════════════════════════════════════
    // IS AUTHENTICATED (sync)
    // ══════════════════════════════════════════
    static isAuthenticated(): boolean {
        const isAuth = !!(
            this.getAccessToken() &&
            this.getRefreshToken() &&
            this.getUserData()
        );
        console.log('🔍 [TokenStorage] Auth check:', {
            hasAccessToken:  !!_cache.accessToken,
            hasRefreshToken: !!_cache.refreshToken,
            hasUserData:     !!_cache.userData,
            isAuthenticated: isAuth,
        });
        return isAuth;
    }

    // ══════════════════════════════════════════
    // UPDATE ACCESS TOKEN (after refresh)
    // ══════════════════════════════════════════
    static async updateAccessToken(
        accessToken: string,
        expiresIn: string | number,
    ): Promise<void> {
        try {
            const expiryTime = calcExpiryTime(expiresIn);

            await Promise.all([
                Keychain.setGenericPassword(KEYS.ACCESS_TOKEN, accessToken),
                Keychain.setGenericPassword(KEYS.TOKEN_EXPIRY, expiryTime.toString()),
            ]);

            _cache.accessToken = accessToken;
            _cache.tokenExpiry = expiryTime;

            console.log('✅ [TokenStorage] Access token updated');
        } catch (error) {
            console.error('❌ [TokenStorage] Error updating access token:', error);
        }
    }

    // ══════════════════════════════════════════
    // CLEAR — logout pe call karo
    // ══════════════════════════════════════════
    static async clearAuthData(): Promise<void> {
        try {
            await Promise.all([
                Keychain.resetGenericPassword({ service: KEYS.ACCESS_TOKEN }),
                Keychain.resetGenericPassword({ service: KEYS.REFRESH_TOKEN }),
                Keychain.resetGenericPassword({ service: KEYS.USER_DATA }),
                Keychain.resetGenericPassword({ service: KEYS.TOKEN_EXPIRY }),
            ]);

            // Memory cache bhi clear karo
            _cache.accessToken  = null;
            _cache.refreshToken = null;
            _cache.userData     = null;
            _cache.tokenExpiry  = null;

            console.log('✅ [TokenStorage] All auth data cleared');
        } catch (error) {
            console.error('❌ [TokenStorage] Error clearing auth data:', error);
        }
    }

    // ══════════════════════════════════════════
    // SUMMARY (debugging ke liye)
    // ══════════════════════════════════════════
    static getAuthSummary() {
        return {
            isAuthenticated: this.isAuthenticated(),
            hasAccessToken:  !!_cache.accessToken,
            hasRefreshToken: !!_cache.refreshToken,
            userData:        _cache.userData,
            tokenExpired:    this.isTokenExpired(),
        };
    }
}

export default TokenStorage;
export type { UserData, TokenData };