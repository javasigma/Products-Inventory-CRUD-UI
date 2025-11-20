import { ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTASection() {
  const navigate = useNavigate();
  const benefits = [
    "Upcoming Premium features",
    "Try it now as it is free",
    "Enhanced productivity",
    "Expert onboarding support"
  ];

  return (
    <section className="py-5 px-3 bg-light">
      <div className="container text-center">
        <h2 className="display-5 fw-bold mb-3">
          Ready to Transform Your Inventory Management?
        </h2>
        <p className="lead text-muted mb-4">
          Join thousands of businesses that trust Aksema to streamline their operations and boost their bottom line.
        </p>

        {/* Benefits */}
        <div className="row justify-content-center mb-4">
          {benefits.map((benefit, i) => (
            <div key={i} className="col-12 col-sm-6 d-flex align-items-center justify-content-center mb-2">
              <CheckCircle size={20} className="text-primary me-2" />
              <span className="text-muted">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <button 
            className="btn btn-primary btn-lg d-flex align-items-center justify-content-center"
            onClick={() => navigate('/login')}
          >
            Start For Free 
            <ArrowRight size={20} className="ms-2" />
          </button>
          <button 
            className="btn btn-outline-primary btn-lg"
            onClick={() => navigate('/login')}
          >
            Sign Up Now 
          </button>
        </div>

        <p className="small text-muted mt-3">
          No credit card required • Get started in under 2 minutes
        </p>
      </div>
    </section>
  );
}