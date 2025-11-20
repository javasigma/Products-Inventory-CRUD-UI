// src/pages/Login.jsx
import React, { useState } from 'react';
import { Button, Form, Container, Tabs, Tab, Spinner, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
// Custom Popup Component
const MessagePopup = ({ show, onClose, title, message, variant = 'danger' }) => (
  <Modal show={show} onHide={onClose} centered size="sm">
    <Modal.Header closeButton className={`border-${variant}`}>
      <Modal.Title className={`text-${variant} fw-bold`}>
        {title || 'AKSEMAINVENTORY'}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Alert variant={variant} className="mb-0 border-0">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            {message}
          </div>
        </div>
      </Alert>
    </Modal.Body>
    <Modal.Footer className="border-0">
      <Button variant={variant} onClick={onClose} className="px-4">
        OK
      </Button>
    </Modal.Footer>
  </Modal>
);
MessagePopup.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['danger', 'warning', 'success', 'info', 'primary', 'secondary'])
};
export default function Login() {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [showPasswordSignIn, setShowPasswordSignIn] = useState(false);
  const [showPasswordSignUp, setShowPasswordSignUp] = useState(false); // for Sign Up main password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // for Confirm Password
  // Agreement states
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedCookies, setAcceptedCookies] = useState(false);
  
  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  
  // Message popup state
  const [showMessage, setShowMessage] = useState(false);
  const [messageData, setMessageData] = useState({ title: '', message: '', variant: 'danger' });

  const { loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || '/dashboard';

  // Show message function
  const showMessagePopup = (title, message, variant = 'danger') => {
    setMessageData({ title, message, variant });
    setShowMessage(true);
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      let errorMessage = 'Sign in failed. Please try again.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please check your password and try again.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        errorMessage = 'No user found with this email address. Please check your email or sign up for a new account.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Your account has been temporarily disabled. Please try again later or reset your password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      showMessagePopup('Sign In Failed', errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate agreements
    if (!acceptedTerms || !acceptedPrivacy || !acceptedCookies) {
      showMessagePopup('Agreement Required', 'Please accept all agreements (Terms of Service, Privacy Policy, and Cookie Policy) to continue with registration.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showMessagePopup('Password Mismatch', 'The passwords you entered do not match. Please make sure both passwords are identical.', 'warning');
      return;
    }

    if (password.length < 6) {
      showMessagePopup('Weak Password', 'Password should be at least 6 characters long for security purposes.', 'warning');
      return;
    }

    if (!companyName.trim()) {
      showMessagePopup('Company Name Required', 'Please provide your company name to complete registration.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, {
        companyName: companyName.trim(),
        companyAddress: companyAddress.trim(),
        companyCity: companyCity.trim(),
        companyPhone: companyPhone.trim(),
        companyTaxId: companyTaxId.trim()
      });
      showMessagePopup('Welcome to AKSEMAINVENTORY', 'Your account has been successfully created! Redirecting to your dashboard...', 'success');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 2000);
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered. Please log in or use a different email address.';
        setTimeout(() => setActiveTab('signin'), 2000);
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long for security.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address you entered is invalid. Please check and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      showMessagePopup('Registration Failed', errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showMessagePopup('Email Required', 'Please enter your email address first to reset your password.', 'info');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessagePopup('Invalid Email', 'Please enter a valid email address to reset your password.', 'warning');
      return;
    }

    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('../api/firebase');
      await sendPasswordResetEmail(auth, email);
      showMessagePopup('Password Reset Sent', `Password reset instructions have been sent to ${email}. Please check your inbox and spam and follow the instructions to reset your password.`, 'success');
    } catch (error) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address you entered is invalid. Please check and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      showMessagePopup('Password Reset Failed', errorMessage, 'danger');
    }
  };

  // Modal components for agreements
  const TermsModal = () => (
    <Modal show={showTermsModal} onHide={() => setShowTermsModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Terms of Service</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <div className="container py-3">
          <h1 className="mb-3">Terms of Service</h1>
          <p className="text-muted">Effective: October 2025</p>
          <p>By accessing or using AKSEMA&apos;s inventory management platform...</p>
          <p>
            Our service is currently offered free of charge during the beta phase. We reserve the right to introduce paid plans with advanced features in the future.
          </p>
          
          <h4>1. Account Registration</h4>
          <p>You must provide accurate information when creating an account and are responsible for maintaining the security of your account.</p>
          
          <h4>2. Acceptable Use</h4>
          <p>You agree not to misuse the AKSEMA service or help anyone else do so.</p>
          
          <h4>3. Data Ownership</h4>
          <p>You retain ownership of any data you submit to the Service. We only process your data to provide the Service.</p>
          
          <h4>4. Service Modifications</h4>
          <p>We may modify or discontinue the Service with notice to users.</p>
          
          <div className="text-center mt-4">
            <button 
              onClick={() => window.open('/termsandconditions.html', '_blank')}
              className="btn btn-primary"
            >
              View Full Terms and Conditions
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );

  const PrivacyModal = () => (
    <Modal show={showPrivacyModal} onHide={() => setShowPrivacyModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Privacy Policy</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <div className="container py-3">
          <h1 className="mb-3">Privacy Policy</h1>
          <p className="text-muted">Last updated: October 2025</p>
          <p>
            At AKSEMA, we respect your privacy and are committed to protecting your personal data. 
            This policy explains how we collect, use, and safeguard your information when you use our AI-powered inventory management platform.
          </p>
          
          <h4>Information We Collect</h4>
          <ul>
            <li>Account information (email, company name)</li>
            <li>Inventory data you input into the system</li>
            <li>Usage data and analytics</li>
          </ul>
          
          <h4>How We Use Your Information</h4>
          <ul>
            <li>To provide and maintain our Services</li>
            <li>To improve user experience</li>
            <li>To communicate with you about the Service</li>
          </ul>
          
          <h4>Data Protection</h4>
          <p>We implement security measures to protect your data and do not sell your personal information to third parties.</p>
          
          <div className="text-center mt-4">
            <button 
              onClick={() => window.open('/privacypolicyfroala.html', '_blank')}
              className="btn btn-primary"
            >
              View Full Privacy Policy
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );

  const CookieModal = () => (
    <Modal show={showCookieModal} onHide={() => setShowCookieModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Cookie Policy</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <div className="container py-3">
          <h1 className="mb-3">Cookie Policy</h1>
          <p className="text-muted">Last updated: October 2025</p>

          <h4>What Are Cookies</h4>
          <p>
            Cookies are small text files that are stored on your computer or mobile device 
            when you visit our website. They help us provide you with a better experience.
          </p>

          <h4>How We Use Cookies</h4>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
          </ul>

          <h4>Managing Cookies</h4>
          <p>
            You can control cookies through your browser settings. However, disabling cookies 
            may affect the functionality of our Service.
          </p>

          <div className="mt-4">
            <Form.Check
              type="checkbox"
              label="I accept the use of necessary cookies for the website to function"
              checked={acceptedCookies}
              onChange={(e) => setAcceptedCookies(e.target.checked)}
            />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="w-100 max-w-md p-4 shadow-lg rounded bg-white">
        <h2 className="text-center mb-4">Welcome to AKSEMAINVENTORY</h2>
        <p className="text-center text-muted mb-4">
          We always require your <strong>Company Authorized </strong> to log in.  
          This measure is part of our enterprise-grade security to ensure authorized access only.  
          For more information, review our{' '}
          <button
            type="button"
            className="btn btn-link p-0 align-baseline"
            onClick={() => window.open('/privacypolicyfroala.html', '_blank')}
          >
            Enterprise Security Policy
          </button>.
        </p>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          <Tab eventKey="signin" title="Sign In">
            <Form onSubmit={handleSignin}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </Form.Group>
              <Form.Group className="mb-3">
  <Form.Label>Password</Form.Label>
  <div className="position-relative">
    <Form.Control
      type={showPasswordSignIn ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <Button
      variant="outline-secondary"
      size="bg"
      className="position-absolute end-0 top-0 h-100 rounded-start-0"
      onClick={() => setShowPasswordSignIn(!showPasswordSignIn)}
      style={{ zIndex: 2 }}
    >
      <i className={showPasswordSignIn ? 'HIDE' : 'SHOW'}></i>
    </Button>
  </div>
  <div className="d-flex justify-content-end mt-1">
    <Button variant="link" size="sm" onClick={handlePasswordReset} className="p-0">
      Forgot password?
    </Button>
  </div>
</Form.Group>
              <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{' '}
                    Logging In...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="signup" title="Sign Up">
            <Form onSubmit={handleSignup}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </Form.Group>
              <Form.Group className="mb-3">
  <Form.Label>Password</Form.Label>
  <div className="position-relative">
    <Form.Control
      type={showPasswordSignUp ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <Button 
      variant="outline-secondary"
      size="bg"
      className="position-absolute end-0 top-0 h-100 rounded-start-0"
      onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}
      style={{ zIndex: 2 }}
    >
      <i className={showPasswordSignIn ? 'HIDE' : 'SHOW'}></i>
    </Button>
  </div>
  <Form.Text className="text-muted">
    Password must be at least 6 characters long
  </Form.Text>
</Form.Group>
<Form.Group className="mb-3">
  <Form.Label>Confirm Password</Form.Label>
  <div className="position-relative">
    <Form.Control
      type={showConfirmPassword ? "text" : "password"}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
    />
    <Button
      variant="outline-secondary"
      size="bg"
      className="position-absolute end-0 top-0 h-100 rounded-start-0"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      style={{ zIndex: 2 }}
    >
      <i className={showPasswordSignIn ? 'HIDE' : 'SHOW'}></i>
    </Button>
  </div>
</Form.Group>
<Form.Group className="mb-3">
  <Form.Label>Company Name</Form.Label>
  <Form.Control
    type="text"
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
    required
    placeholder="e.g., ABC Pharma Inc."
  />
</Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Company Address</Form.Label>
                <Form.Control
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="e.g., 123 Business Ave"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  value={companyCity}
                  onChange={(e) => setCompanyCity(e.target.value)}
                  placeholder="e.g., Casablanca"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="e.g., +212 6 XX XX XX XX"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tax ID / Registration Number</Form.Label>
                <Form.Control
                  type="text"
                  value={companyTaxId}
                  onChange={(e) => setCompanyTaxId(e.target.value)}
                  placeholder="e.g., 12345678"
                />
              </Form.Group>

              {/* Agreement Checkboxes */}
              <div className="border-top pt-3 mt-3">
                <Form.Check
                  type="checkbox"
                  id="terms-checkbox"
                  label={
                    <span>
                      I agree to the{' '}
                      <Button variant="link" className="p-0" onClick={() => setShowTermsModal(true)}>
                        Terms of Service
                      </Button>
                    </span>
                  }
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mb-2"
                />
                
                <Form.Check
                  type="checkbox"
                  id="privacy-checkbox"
                  label={
                    <span>
                      I agree to the{' '}
                      <Button variant="link" className="p-0" onClick={() => setShowPrivacyModal(true)}>
                        Privacy Policy
                      </Button>
                    </span>
                  }
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mb-2"
                />
                
                <Form.Check
                  type="checkbox"
                  id="cookies-checkbox"
                  label={
                    <span>
                      I accept the{' '}
                      <Button variant="link" className="p-0" onClick={() => setShowCookieModal(true)}>
                        Cookie Policy
                      </Button>
                    </span>
                  }
                  checked={acceptedCookies}
                  onChange={(e) => setAcceptedCookies(e.target.checked)}
                />
              </div>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mt-3" 
                disabled={loading || !acceptedTerms || !acceptedPrivacy || !acceptedCookies}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{' '}
                    Signing Up...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </Form>
          </Tab>
        </Tabs>

        <p className="text-center mt-3 text-muted small">
          The System is google supported Gmail is compatible other emails are accepted. Please Sign up for a new Inventory Dashboard.
        </p>

        {/* Modals */}
        <TermsModal />
        <PrivacyModal />
        <CookieModal />

        {/* Message Popup */}
        <MessagePopup 
          show={showMessage}
          onClose={() => setShowMessage(false)}
          title={messageData.title}
          message={messageData.message}
          variant={messageData.variant}
        />
      </div>
    </Container>
  );
}