// src/utils/cookies.js
import Cookies from 'js-cookie';

export const cookieService = {
  // Check if user has given consent
  hasConsent: () => {
    return Cookies.get('cookie-consent') === 'accepted';
  },

  // Set user preferences
  setUserPreferences: (preferences) => {
    if (cookieService.hasConsent()) {
      Cookies.set('user-preferences', JSON.stringify(preferences), { expires: 365 });
    }
  },

  // Get user preferences
  getUserPreferences: () => {
    const prefs = Cookies.get('user-preferences');
    return prefs ? JSON.parse(prefs) : null;
  },

  // Set session data
  setSessionData: (key, value) => {
    Cookies.set(key, value, { expires: 1 }); // 1 day expiry
  },

  // Get session data
  getSessionData: (key) => {
    return Cookies.get(key);
  },

  // Clear all cookies (except necessary ones)
  clearAllCookies: () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      if (!cookieName.includes('necessary')) {
        Cookies.remove(cookieName);
      }
    });
  }
};