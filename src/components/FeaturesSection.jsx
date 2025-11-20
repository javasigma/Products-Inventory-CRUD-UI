import { 
  BarChart3, Bell, Shield, Brain, 
  Zap, LineChart, TrendingUp, Clock, Database 
} from "lucide-react"
import styles from './FeaturesSection.module.css'  // Changed import
import 'bootstrap/dist/css/bootstrap.min.css';

export function FeaturesSection() {
  const features = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Get instant insights into your inventory performance with comprehensive dashboards and reporting tools.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Never run out of stock again with intelligent notifications and automated reorder suggestions.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption, role-based access, and compliance certifications.",
    },
    {
      icon: Brain,
      title: "AI-Powered Stock Optimization",
      description: "Leverage advanced AI to analyze sales trends and suggest optimal stock levels to minimize overstock and stockouts.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed with modern architecture that handles millions of transactions without breaking a sweat.",
    },
    {
      icon: LineChart,
      title: "Sales Trend Analysis",
      description: "Identify top-selling items and seasonal patterns with AI-driven insights to inform purchasing decisions.",
    },
    {
      icon: TrendingUp,
      title: "Demand Forecasting",
      description: "Predict future demand using AI-powered analytics and historical data patterns.",
    },
    {
      icon: Clock,
      title: "Automated Workflows",
      description: "Streamline operations with customizable automation rules and integrations.",
    },
    {
      icon: Database,
      title: "Multi-location Support",
      description: "Manage inventory across multiple warehouses, stores, and distribution centers.",
    },
  ]

  return (
    <section id="features" className="py-5 px-3">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="h2 fw-bold mb-3">
            Everything You Need to Manage Inventory
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
            Powerful features designed to streamline your operations, reduce costs, 
            and help your business grow with confidence.
          </p>
        </div>

        <div className="row g-4">
          {features.map((feature, index) => (
            <div className="col-12 col-md-6 col-lg-4" key={index}>
              <div className={`card h-100 border-0 shadow-sm ${styles.featuresCard}`}>
                <div className={`card-body ${styles.cardBody}`}>
                  <div className={`bg-primary bg-opacity-10 d-flex align-items-center justify-content-center rounded mb-3 ${styles.iconContainer}`} style={{ width: "50px", height: "50px" }}>
                    <feature.icon className="text-primary" size={22} />
                  </div>
                  <h5 className={`card-title fw-semibold ${styles.cardTitle}`}>{feature.title}</h5>
                  <p className={`card-text text-muted ${styles.cardText}`}>{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}