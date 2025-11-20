// src/components/CookieConsent.jsx
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './CookieConsent.css';


const handleViewFullPolicy = () => {
    // Open the HTML file in a new tab
    window.open('/privacypolicyfroala.html', '_blank');
    
    // Or if the HTML file is in public folder, use:
    // window.open('/privacy-policy.html', '_blank');
    
    // Or if you want to download it:
    // const link = document.createElement('a');
    // link.href = '/privacy-policy.html';
    // link.download = 'privacy-policy.html';
    // link.click();
  };



export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = Cookies.get('cookie-consent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    // Set cookie for 1 year
    Cookies.set('cookie-consent', 'accepted', { expires: 365 });
    
    // Also set necessary cookies for functionality
    Cookies.set('necessary-cookies', 'true', { expires: 365 });
    
    setShowBanner(false);
  };

  const rejectCookies = () => {
    // Only set necessary cookies (required for site to function)
    Cookies.set('cookie-consent', 'rejected', { expires: 365 });
    Cookies.set('necessary-cookies', 'true', { expires: 365 });
    
    // Remove any non-essential cookies that might have been set
    Cookies.remove('analytics-cookies');
    Cookies.remove('marketing-cookies');
    
    setShowBanner(false);
  };

  const customizeCookies = () => {
    // You can implement a modal for granular cookie preferences
    // For now, we'll just accept all
    acceptCookies();
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-content">
        <h3>Cookie Preferences</h3>
        <p>
          We use cookies to enhance your browsing experience, serve personalized content, 
          and analyze our traffic. By clicking ”Accept All“, you consent to our use of cookies.
        </p>
        <div className="cookie-buttons">
          <button onClick={rejectCookies} className="btn btn-outline-primary btn-sm">
            Necessary Only
          </button>
          <button onClick={customizeCookies} className="btn btn-outline-primary btn-sm">
            Customize
          </button>
          <button onClick={acceptCookies} className="btn btn-primary btn-sm">
            Accept All
          </button>
        </div>
        <a  onClick={handleViewFullPolicy} className="cookie-policy-link">
          Learn more in our Cookie Policy
        </a>
      </div>
    </div>
  );
}