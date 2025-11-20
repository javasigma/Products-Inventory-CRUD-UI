// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { auth } from "../api/firebase";
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { registerUser, getUserProfile } from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(null); // ✅ Track backend sync errors

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        setBackendError(null); // ✅ Clear previous errors
        
        try {
          console.log('🔄 Syncing with backend for user:', firebaseUser.email);
          
          // ✅ FIXED: Better error handling for registration
          try {
            const registerResponse = await registerUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              companyName: firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'My Company'
            });
            
            // ✅ Check if registration returned an error (but didn't throw)
            if (registerResponse && registerResponse.error) {
              console.warn('⚠️ Backend registration warning:', registerResponse.message);
              // This is OK - user might already exist, continue to get profile
            } else {
              console.log('✅ User registered with backend successfully');
            }
          } catch (registerError) {
            console.warn('⚠️ Registration with backend failed (may be normal):', registerError.message);
            // Don't block the user - this might be normal if user already exists
          }
          
          // ✅ FIXED: Try to get user profile with better error handling
          try {
            const userProfile = await getUserProfile();
            setBackendUser(userProfile);
            console.log('✅ User profile loaded from backend:', userProfile);
          } catch (profileError) {
            console.warn('⚠️ Could not load user profile:', profileError.message);
            setBackendError('Failed to load user profile from backend');
            // User can still use the app, just without backend data
          }
          
        } catch (error) {
          console.error('❌ Critical error syncing with backend:', error);
          setBackendError('Failed to sync with backend server');
          // Don't set loading to false here - let user continue with Firebase auth
        }
      } else {
        // User signed out
        setUser(null);
        setToken(null);
        setBackendUser(null);
        setBackendError(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      setBackendError(null);
      return result;
    } catch (error) {
      setBackendError('Google sign-in failed');
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      setBackendError(null);
      return result;
    } catch (error) {
      setBackendError('Email login failed');
      throw error;
    }
  };

  const registerWithEmail = async (email, password, companyName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // ✅ FIXED: Better error handling for backend registration
      try {
        await registerUser({
          uid: result.user.uid,
          email: result.user.email,
          companyName: companyName
        });
        console.log('✅ New user registered with backend');
      } catch (registerError) {
        console.warn('⚠️ Backend registration failed after Firebase auth:', registerError.message);
        // Don't throw - user is authenticated with Firebase, backend sync can happen later
      }
      
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      setBackendError(null);
      return result;
    } catch (error) {
      setBackendError('Email registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      setBackendUser(null);
      setBackendError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setBackendError('Logout failed');
    }
  };

  const refreshToken = async () => {
    if (!auth.currentUser) return null;
    try {
      const newToken = await auth.currentUser.getIdToken(true);
      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  // ✅ ADDED: Function to retry backend sync
  const retryBackendSync = async () => {
    if (!user) return;
    
    setBackendError(null);
    try {
      const userProfile = await getUserProfile();
      setBackendUser(userProfile);
      console.log('✅ Backend sync retry successful');
    } catch (error) {
      console.error('❌ Backend sync retry failed:', error);
      setBackendError('Backend synchronization failed');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      backendUser,
      backendError, // ✅ Expose backend errors
      loading, 
      signInWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout, 
      refreshToken,
      retryBackendSync // ✅ Add retry function
    }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};