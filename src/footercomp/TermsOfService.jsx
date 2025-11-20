export default function TermsOfService() {
    const handleViewFullTerms = () => {
      // Open the HTML file in a new tab
      window.open('/termasandconditions.html', '_blank');
    };
  
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="mb-4">Terms of Service</h1>
            <p className="text-muted">Effective: October 2025</p>
            <p>
              By accessing or using AKSEMA‘s inventory management platform, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
            <p>
              Our service is currently offered free of charge during the beta phase. We reserve the right to introduce paid plans with advanced features in the future.
            </p>
            
            {/* Button to view full Terms and Conditions */}
            <div className="text-center mt-4">
              <button 
                onClick={handleViewFullTerms}
                className="btn btn-primary btn-lg"
              >
                View Full Terms and Conditions
              </button>
            </div>
  
            <p className="mt-4 text-center">
              <em>Questions? Reach out to our team aksemainventory@gmail.com</em>
            </p>
          </div>
        </div>
      </div>
    );
  }