// src/components/PrivateRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// 1. Import the necessary functions from the Firebase Auth SDK
import { onAuthStateChanged } from 'firebase/auth';
// 2. Import your initialized Firebase Auth instance
import { auth } from '../api/firebase';

const PrivateRoute = ({ children }) => {
  // 3. State to track whether we are still checking the auth status
  const [isLoading, setIsLoading] = useState(true);
  // 4. State to track whether the user is confirmed logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 5. Set up the listener for auth state changes
    // This callback fires immediately with the current auth state
    // and then again whenever the state changes (login, logout)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        console.log("[PrivateRoute] User is authenticated:", user.email);
        setIsLoggedIn(true);
      } else {
        // User is signed out
        console.log("[PrivateRoute] No user is authenticated.");
        setIsLoggedIn(false);
      }
      // 6. Regardless of the outcome, we are done checking the initial state
      setIsLoading(false);
    });

    // 7. Cleanup subscription on unmount to prevent memory leaks
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs only once after the initial render

  // 8. While isLoading is true, show a loading indicator or nothing
  // This prevents premature redirects or rendering the wrong content
  if (isLoading) {
    // You can replace this with a dedicated loading spinner component if desired
    return <div className="d-flex justify-content-center align-items-center min-vh-100">Checking access...</div>;
    // Alternatively, return null; for a blank screen while loading
  }

  // 9. After loading is complete:
  if (isLoggedIn) {
    // If the user is logged in, render the protected children (e.g., DashboardPage)
    return children;
  } else {
    // If the user is not logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;