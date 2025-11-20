export default function ApiDocumentation() {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="mb-4">API Documentation</h1>
            <p>
              Our RESTful API allows you to integrate AKSEMA’s AI inventory intelligence into your own applications.
            </p>
            <div className="card bg-light p-4 mb-4">
              <code className="d-block">GET https://api.aksema.com/v1/inventory</code>
              <small className="text-muted">Authentication: Bearer Token</small>
            </div>
            <p>
              Full documentation, SDKs, and Postman collections are coming soon.
            </p>
            <p>
              For early access or enterprise API needs, please stay tuned in our  <a  href="https://aksemai-inventory.netlify.app/" target="_blank" rel="noreferrer" className="text-primary">website</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }