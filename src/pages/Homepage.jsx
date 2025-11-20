// src/pages/HomePage.jsx
import { useState } from 'react';
import AppNavbar from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { StatsSection } from "../components/StatsSection";
import { CTASection } from "../components/CtaSection";
import Footer from "../components/Footer";
import './Homepage.css';

// Import all footer page components
import {
  PrivacyPolicy,
  TermsOfService,
  CookiePolicy,
  HelpCenter,
  ContactUs,
  Community,
  StatusPage,
  Security,
  Integrations,
  ApiDocumentation,
  Pricing
} from '../footercomp';
// In your HomePage.jsx



export default function HomePage() {
  const [activeSection, setActiveSection] = useState(null); // null = show homepage

  // Handle link clicks from both Navbar and Footer
  const handleLinkClick = (section) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to render content
  const renderContent = () => {
    if (activeSection === 'privacy') return <PrivacyPolicy />;
    if (activeSection === 'terms') return <TermsOfService />;
    if (activeSection === 'help') return <HelpCenter />;
    if (activeSection === 'contact') return <ContactUs />;
    if (activeSection === 'community') return <Community />;
    if (activeSection === 'status') return <StatusPage />;
    if (activeSection === 'security') return <Security />;
    if (activeSection === 'integrations') return <Integrations />;
    if (activeSection === 'api') return <ApiDocumentation />;
    if (activeSection === 'pricing') return <Pricing />;
    if (activeSection === 'about') return <FeaturesSection />;
    if (activeSection === 'cookies') return <CookiePolicy />;
    
    // Default homepage content
    return (
      <>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <CTASection />
      </>
    );
  };

  return (
    <div className="homepage-container">
      <AppNavbar 
        onLinkClick={handleLinkClick} // Add this line - same function as Footer
      />
      <main>
        {renderContent()}
      </main>
      <Footer 
        onLinkClick={handleLinkClick}
      />
    </div>
  );
}