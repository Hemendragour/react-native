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

            let parsedUserData: UserData | null = null;
            if (userDataStr && userDataStr !== 'undefined' && userDataStr !== 'null') {
                try {
                    parsedUserData = JSON.parse(userDataStr);
                } catch (e) {
                    console.warn('⚠️ [TokenStorage] Could not parse stored user data:', e);
                }
            }

            _cache.accessToken  = accessToken ? accessToken.password : null;
            _cache.refreshToken = refreshToken ? refreshToken.password : null;
            _cache.userData     = parsedUserData;
            _cache.tokenExpiry  = expiryStr ? parseInt(expiryStr) : null;

            console.log('✅ [TokenStorage] Initialized from SecureStore', {
                hasAccessToken:  !!accessToken,
                hasRefreshToken: !!refreshToken,
                hasUserData:     !!parsedUserData,
            });
        } catch (error) {
            console.error('❌ [TokenStorage] Init failed:', error);
        }
    }

    // ══════════════════════════════════════════
    // SET — login/register ke baad call karo
    // ══════════════════════════════════════════
    static async setAuthData(tokens: TokenData, user?: UserData | null): Promise<void> {
        try {
            const expiryTime = calcExpiryTime(tokens.expiresIn);
            const currentUser = user || _cache.userData;

            const storagePromises: Promise<any>[] = [
                Keychain.setGenericPassword('token', tokens.accessToken,  { service: KEYS.ACCESS_TOKEN }),
                Keychain.setGenericPassword('token', tokens.refreshToken, { service: KEYS.REFRESH_TOKEN }),
                AsyncStorage.setItem(KEYS.TOKEN_EXPIRY, expiryTime.toString()),
            ];

            if (currentUser) {
                storagePromises.push(AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(currentUser)));
            }

            await Promise.all(storagePromises);

            // Memory cache update karo (sync access ke liye)
            _cache.accessToken  = tokens.accessToken;
            _cache.refreshToken = tokens.refreshToken;
            _cache.userData     = currentUser;
            _cache.tokenExpiry  = expiryTime;

            console.log('✅ [TokenStorage] Auth data stored', {
                userId:     currentUser?.userId,
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
        // NOTE: We intentionally do NOT check expiry here anymore.
        // The response interceptor handles 401 → silent refresh.
        // Returning null here was causing isAuthenticated() to fail
        // after 15 min, logging the user out even though the
        // refresh token (7–30 days) was still perfectly valid.
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
        if (expired) console.log('ℹ️ [TokenStorage] Access token expired (will refresh silently)');
        return expired;
    }

    // ══════════════════════════════════════════
    // IS AUTHENTICATED (sync)
    //
    // Instagram/LinkedIn approach:
    // User is "authenticated" as long as a refresh
    // token exists. The short-lived access token
    // expiring is normal — interceptor refreshes it.
    // ══════════════════════════════════════════
    static isAuthenticated(): boolean {
        const isAuth = !!(
            this.getRefreshToken() &&
            this.getUserData()
        );
        console.log('🔍 [TokenStorage] Auth check:', {
            hasAccessToken:  !!_cache.accessToken,
            hasRefreshToken: !!_cache.refreshToken,
            hasUserData:     !!_cache.userData,
            accessTokenExpired: this.isTokenExpired(),
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

            // await Promise.all([
            //     Keychain.setGenericPassword(KEYS.ACCESS_TOKEN, accessToken),
            //     Keychain.setGenericPassword(KEYS.TOKEN_EXPIRY, expiryTime.toString()),
            // ]);

            // FIX: service option here too
            // Keychain.setGenericPassword('token', accessToken, { service: KEYS.ACCESS_TOKEN });
            // // FIX: expiry in AsyncStorage
            // AsyncStorage.setItem(KEYS.TOKEN_EXPIRY, expiryTime.toString());

            // ✅ FIX: wrapped in await Promise.all to ensure storage finishes before continuing
            await Promise.all([
                Keychain.setGenericPassword('token', accessToken, { service: KEYS.ACCESS_TOKEN }),
                AsyncStorage.setItem(KEYS.TOKEN_EXPIRY, expiryTime.toString())
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
            // await Promise.all([
            //     Keychain.resetGenericPassword({ service: KEYS.ACCESS_TOKEN }),
            //     Keychain.resetGenericPassword({ service: KEYS.REFRESH_TOKEN }),
            //     Keychain.resetGenericPassword({ service: KEYS.USER_DATA }),
            //     Keychain.resetGenericPassword({ service: KEYS.TOKEN_EXPIRY }),
            // ]);

            await Promise.all([
                // ✅ FIX: service option on reset
                Keychain.resetGenericPassword({ service: KEYS.ACCESS_TOKEN }),
                Keychain.resetGenericPassword({ service: KEYS.REFRESH_TOKEN }),
                // ✅ FIX: remove from AsyncStorage (consistent with setAuthData)
                AsyncStorage.removeItem(KEYS.USER_DATA),
                AsyncStorage.removeItem(KEYS.TOKEN_EXPIRY),
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