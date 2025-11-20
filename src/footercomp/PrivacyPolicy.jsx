export default function PrivacyPolicy() {
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
  
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="mb-4">Privacy Policy</h1>
            <p className="text-muted">
              Last updated: October 2025
            </p>
            <p>
              At AKSEMA, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you use our AI-powered inventory management platform.
            </p>
            <p>
              We do not sell your data. All data is processed in compliance with GDPR and CCPA standards.
            </p>
            
            {/* Button to view full HTML policy */}
            <div className="text-center mt-4">
              <button 
                onClick={handleViewFullPolicy}
                className="btn btn-primary btn-lg"
              >
                View Full Privacy Policy
              </button>
            </div>
  
            <p className="mt-4 text-center">
              <em>Need more details? please feel free to ask in our email: aksemainventory@gmail.com  <a  href="https://aksemai-inventory.netlify.app/" target="_blank" rel="noreferrer" className="text-primary">website</a>..</em>
            </p>
          </div>
        </div>
      </div>
    );
  }