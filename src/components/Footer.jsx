// src/components/Footer.jsx
import {  Instagram, Github } from "lucide-react";
import './Footer.css';
import React from "react";
import PropTypes from 'prop-types';


export default function Footer({ onLinkClick = null }) {
  const handleLink = (section) => {
    if (onLinkClick) {
      onLinkClick(section);
    }
  };

  // Helper: render link based on mode
  const renderLink = (section, label) => {
    if (onLinkClick) {
      return (
        <button
          type="button"
          onClick={() => handleLink(section)}
          className="text-white-50 text-decoration-none d-block mb-2 nav-link-custom bg-transparent border-0 text-start"
        >
          {label}
        </button>
      );
    }
    // Fallback if used elsewhere with routing
    return <a href="#" className="text-white-50 text-decoration-none d-block mb-2 nav-link-custom">{label}</a>;
  };

  Footer.propTypes = {
    onLinkClick: PropTypes.func,
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container px-4">
        <div className="row py-5 gy-4">
          {/* Company info */}
          <div className="col-lg-3">
          <div className="d-flex align-items-center mb-4">
  <img
    src="/assets/asset2.png"
    alt="AKSEMA Logo"
    className="logo-img me-2"
    style={{ height: "200px", width: "200px", objectFit: "contain", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
  />
  <span className="h5 fw-bold mb-0">                            </span>
</div>
            <p className="text-white-50 mb-4">
              Streamline your inventory management with our powerful,
              AI-Powered platform trusted by businesses worldwide.
            </p>
            <div className="d-flex gap-2">
              <a href="https://www.instagram.com/ayayatek_ti_asnom" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center social-link">
                <Instagram size={18} />
              </a>
              <a href="mailto:aksemainventoryr@gmail.com" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
              <a href="https://linkedin.com" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="https://github.com/javasigma" className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center social-link">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-semibold mb-4">Service</h5>
            <ul className="list-unstyled">
              <li><button type="button" onClick={() => handleLink('featuressection')} className="text-white-50 text-decoration-none d-block mb-2 nav-link-custom bg-transparent border-0 text-start">Features</button></li>
              <li><button type="button" onClick={() => handleLink('pricing')} className="text-white-50 text-decoration-none d-block mb-2 nav-link-custom bg-transparent border-0 text-start">Pricing</button></li>
              <li>{renderLink('integrations', 'Integrations')}</li>
              <li><button type="button" onClick={() => handleLink('api')} className="text-white-50 text-decoration-none d-block mb-2 nav-link-custom bg-transparent border-0 text-start">Api Documentation</button></li>
              <li><button type="button" onClick={() => handleLink('mobile-apps')} className="text-white-50 text-decoration-none d-block mb-2 nav-link-custom bg-transparent border-0 text-start">Mobile Apps</button></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-semibold mb-4">Company</h5>
            <ul className="list-unstyled">
              <li>{renderLink('about', 'About Us')}</li>
              <li>{renderLink('cookies', 'Cookie Policy')}</li>
              <li>{renderLink('privacy', 'Privacy Policy')}</li>
              <li>{renderLink('terms', 'Terms of Service')}</li>
              <li>{renderLink('privacy', 'Parteners')}</li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-semibold mb-4">Support</h5>
            <ul className="list-unstyled">
              <li>{renderLink('help', 'Help Center')}</li>
              <li>{renderLink('contact', 'Contact Us')}</li>
              <li>{renderLink('community', 'Community')}</li>
              <li>{renderLink('status', 'Status Page')}</li>
              <li>{renderLink('security', 'Security')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-top border-light pt-4 mt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="text-white-50 small mb-2 mb-md-0">
            © 2025 InventoryPro. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            
            
            
          </div>
        </div>
      </div>
    </footer>
  );



}