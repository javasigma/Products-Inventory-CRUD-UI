import React from 'react';
 // Optional: add custom styles if needed

export default function Pricing() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center">
          <h1 className="display-5 fw-bold mb-4">Pricing</h1>
          <p className="lead text-muted mb-5">
            Enjoy our AI-powered inventory management system <strong>for free</strong>!
          </p>
          <div className="alert alert-info">
            <h5 className="mb-3">We’re working on premium plans.</h5>
            <p className="mb-0">
              Premium subscription plans with advanced features are currently in development.
              Stay tuned for updates — no payment required for now.
            </p>
          </div>
          <p className="text-muted mt-4">
            Have questions?  Reach out to us aksemainventory@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}