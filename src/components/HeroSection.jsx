// src/components/HeroSection.jsx
import { Button } from "react-bootstrap";
import { ArrowRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {  } from "lucide-react";

import './HeroSection.css';



export function HeroSection() {
  const navigate = useNavigate();
  
  return (
    <section className="py-5 bg-light text-center">
      <div className="container">
        {/* Badge */}
        <div className="d-inline-flex align-items-center px-2 py-3 rounded-pill border border-primary bg-light text-primary fw-semibold big">
  ✨ AI-Powered Inventory tracking ✨
</div>

      

        {/* Main Headline */}
        <h1 className="display-4 fw-bold mb-3">
          Streamline Your Inventory{" "}
          <span className="text-primary d-block">Management Today</span>
        </h1>

        {/* Subheadline */}
        <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: "700px", maxHeight: "300px" }}>
          Track stock levels, automate reorders, and optimize your supply chain
          with enterprise-grade tools designed for modern businesses.
        </p>

        {/* CTA Buttons */}
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-5">
          <Button size="lg" variant="primary" className="d-flex align-items-center px-4" onClick={() => navigate('/login')}>
            Start Now For Free
            <ArrowRight size={20} className="ms-2" />
          </Button>
          <Button size="lg" variant="outline-primary" className="d-flex align-items-center px-4" href="https://charming-madeleine-4b74b6.netlify.app/" target="_blank" rel="noopener noreferrer">
            <User size={20} className="me-2" />
            Developer
          </Button>
        </div>

        {/* Hero Image with Accent Glow */}
        <div className="position-relative mx-auto" style={{ maxWidth: "1000px" }}>
          <div
            className="p-3 p-sm-5 rounded shadow-lg border"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,123,255,0.1), rgba(255,0,128,0.1))",
            }}
          >
            <img
              src="/assets/asset1.png"
              alt="InventoryPro Dashboard"
              className="img-fluid rounded shadow"
            />
          </div>
            
          {/* Floating Labels */}
          <div className="position-absolute top-0 start-0 translate-middle bg-danger text-white px-3 py-1 rounded shadow-sm fw-medium small">
            Real-time Updates
          </div>
          <div className="position-absolute bottom-0 end-0 translate-middle bg-warning text-dark px-3 py-1 rounded shadow-sm fw-medium small">
            99% Accuracy 
          </div>
        </div>
      </div>
    </section>
  );
}
