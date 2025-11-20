// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Spinner, 
  Button,
  Table,
  Badge
} from 'react-bootstrap';
import { 
  Users, 
  Package, 
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  RefreshCw,
  Brain,
  TrendingUp,
  UserPlus,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getDashboardData, 
  getUserProfile, 
// getlow getmonthly
  getRecentActivity,
  getActivityStats
} from '../api/api';
import './DashboardPage.css';
import  DashboardSettings  from '../components/DashboardSettings';
import AiChatWidget from '../components/AiChatWidget';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { backendUser } = useAuth();
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Helper function to format activity dates from backend
  const formatActivityDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.warn("Error formatting date:", error);
      return dateString;
    }
  };

  // Fetch activities from backend
  const loadRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      console.log("[DashboardPage] Loading recent activities...");
      const activityData = await getRecentActivity();
      console.log("📊 [DEBUG] Raw activities from backend:", activityData);
      if (activityData && Array.isArray(activityData) && activityData.length > 0) {
        const transformedActivities = activityData.map(activity => ({
          id: activity.id || `activity_${Date.now()}_${Math.random()}`,
          action: activity.action || 'System',
          description: activity.description || 'Activity recorded',
          date: formatActivityDate(activity.date),
          status: activity.status || 'info'
        }));
        console.log("📊 [DEBUG] Transformed activities:", transformedActivities);
        setActivities(transformedActivities);
        return transformedActivities;
      } else {
        console.log("📊 [DEBUG] No activities, using defaults");
        const defaults = getDefaultActivity();
        setActivities(defaults);
        return defaults;
      }
    } catch (error) {
      console.error("[DashboardPage] Failed to load activities:", error);
      const defaults = getDefaultActivity();
      setActivities(defaults);
      return defaults;
    } finally {
      setActivitiesLoading(false);
    }
  };
  // Add this useEffect to debug the actual state
useEffect(() => {
  if (dashboardData) {
    console.log("🔄 [STATE DEBUG] Current dashboardData:", dashboardData);
    console.log("🔄 [STATE DEBUG] Current stats:", dashboardData.stats);
    console.log("🔄 [STATE DEBUG] Current activities:", activities);
  }
}, [dashboardData, activities]);

  useEffect(() => {

    const loadDashboardData = async () => {
      console.log("[DashboardPage] Starting data fetch...");
      try {
        const [dashboardResult, activitiesResult, statsResult] = await Promise.allSettled([
          getDashboardData(),
          loadRecentActivities(),
          getActivityStats()
        ]);
        
        // Add this debug to see what's happening
        console.log("🔍 [DEBUG] Stats result details:", {
          status: statsResult.status,
          value: statsResult.value,
          reason: statsResult.reason
        });
    
        console.log("📊 [DEBUG] All promises settled:", {
          dashboard: dashboardResult.status,
          activities: activitiesResult.status,
          stats: statsResult.status
        });

        const baseData = dashboardResult.status === 'fulfilled' ? dashboardResult.value : null;
        const loadedActivities = activitiesResult.status === 'fulfilled' ? activitiesResult.value : [];
    
        console.log("📊 [DEBUG] Raw stats result:", statsResult);
        
        let finalStats = getDefaultStats();
        
        // Check if stats were successful and have data
        if (statsResult.status === 'fulfilled' && statsResult.value) {
          console.log("📊 [DEBUG] Using stats from activity endpoint:", statsResult.value);
          finalStats = {
            totalProducts: statsResult.value.totalProducts || statsResult.value.productCount || 0,
            totalCustomers: statsResult.value.totalCustomers || statsResult.value.customerCount || 0,
            monthlyRevenue: statsResult.value.monthlyRevenue || statsResult.value.revenue || 0,
            lowStockItems: statsResult.value.lowStockItems || statsResult.value.lowStockCount || 0,
            totalSales: statsResult.value.totalSales || 0,
            pendingOrders: statsResult.value.pendingOrders || 0
          };
        } else if (baseData && baseData.stats) {
          console.log("📊 [DEBUG] Using stats from dashboard endpoint:", baseData.stats);
          finalStats = {
            totalProducts: baseData.stats.totalProducts || 0,
            totalCustomers: baseData.stats.totalCustomers || 0,
            monthlyRevenue: baseData.stats.monthlyRevenue || 0,
            lowStockItems: baseData.stats.lowStockItems || 0,
            totalSales: baseData.stats.totalSales || 0,
            pendingOrders: baseData.stats.pendingOrders || 0
          };
        } else {
          console.log("📊 [DEBUG] Using default stats");
        }
    
        console.log("📊 [DEBUG] Final stats to use:", finalStats);
        console.log("📊 [DEBUG] Activities data:", loadedActivities);
        console.log("📊 [DEBUG] Base dashboard data:", baseData);
    
        let dashboardDataToSet;
    
        if (baseData) {
          dashboardDataToSet = {
            ...baseData,
            stats: finalStats, // Override with our calculated stats
            recentActivity: loadedActivities
          };
        } else {
          try {
            const userData = await getUserProfile();
            dashboardDataToSet = {
              user: userData,
              stats: finalStats,
              welcomeMessage: `Welcome back, ${userData.companyName}`,
              recentActivity: loadedActivities
            };
          } catch (profileError) {
            console.error("❌ [DEBUG] Profile fetch failed:", profileError);
            dashboardDataToSet = {
              ...getDefaultDashboardData(),
              stats: finalStats,
              recentActivity: loadedActivities
            };
          }
        }
    
        console.log("📊 [DEBUG] Setting dashboard data:", dashboardDataToSet);
        setDashboardData(dashboardDataToSet);
        loadAiInsights(loadedActivities, finalStats);
    
      } catch (err) {
        console.error("[DashboardPage] Error in loadDashboardData:", err);
        const fallbackData = getDefaultDashboardData();
        console.log("📊 [DEBUG] Error fallback data:", fallbackData);
        setDashboardData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    const loadAiInsights = async (activityData = [], stats = {}) => {  // ✅ Add stats parameter
      try {
        setAiLoading(true);
        
        const insights = generateAiInsights(
          [],
          [],
          activityData,
          stats // ✅ Now stats is available
        );
        setAiInsights(insights);
      } catch (error) {
        console.warn('Failed to load AI insights:', error);
        setAiInsights(getStaticAiInsights());
      } finally {
        setAiLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getDefaultStats = () => ({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    lowStockItems: 0,
    monthlyRevenue: 0,
    pendingOrders: 0
  });

  const getDefaultActivity = () => [
    { id: 1, action: 'System', description: 'Welcome to your dashboard', date: 'Just now', status: 'info' },
    { id: 2, action: 'Setup', description: 'Add products, vendors, and customers', date: 'Today', status: 'info' }
  ];

  const getDefaultDashboardData = () => ({
    user: backendUser || { companyName: 'Your Company' },
    stats: getDefaultStats(),
    welcomeMessage: `Welcome to your dashboard`,
    recentActivity: activities.length > 0 ? activities : getDefaultActivity()
  });

  const generateAiInsights = (lowStockData, revenueData, activityData, stats = {}) => {
    const lowStockCount = Array.isArray(lowStockData) ? lowStockData.length : (stats.lowStockItems || 0);
    const recentActivityCount = Array.isArray(activityData) ? activityData.length : 0;
    const hasRevenueData = Array.isArray(revenueData) && revenueData.length > 0;
    const monthlyRevenue = stats.monthlyRevenue || 0;
    
    return {
      insights: [
        {
          id: 1,
          title: '📊 Activity Analysis',
          description: `${recentActivityCount} activities tracked. ${stats.totalProducts || 0} products and ${stats.totalCustomers || 0} customers in system.`,
          type: 'info',
          priority: 'medium'
        },
        {
          id: 2,
          title: '⚠️ Stock Monitoring',
          description: lowStockCount > 0 
            ? `${lowStockCount} items need immediate restocking attention`
            : 'Stock levels are optimal.',
          type: lowStockCount > 0 ? 'warning' : 'success',
          priority: lowStockCount > 0 ? 'high' : 'medium'
        },
        {
          id: 3,
          title: '💰 Revenue Insights',
          description: hasRevenueData 
            ? `Revenue tracking active with ${monthlyRevenue} data points` 
            : 'No revenue data available',
          type: hasRevenueData ? 'success' : 'info',
          priority: 'medium'
        }
      ],
      quickQuestions: [
        "Show recent business activities",
        "List low stock items",
        "Top selling products this month", 
        "Vendor performance analysis"
      ]
    };
  };

  const getStaticAiInsights = () => ({
    insights: [
      {
        id: 1,
        title: '📊 Real-time Activities',
        description: 'Track sales, stock changes, and product additions.',
        type: 'info',
        priority: 'medium'
      }
    ],
    quickQuestions: []
  });

  const handleRefreshActivities = async () => {
    console.log("[DashboardPage] Manual refresh triggered");
    await loadRecentActivities();
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        recentActivity: activities
      });
    }
  };

  const data = dashboardData || getDefaultDashboardData();
  const stats = data.stats || getDefaultStats();
  const recentActivity = activities.length > 0 ? activities : (data.recentActivity || getDefaultActivity());
  const insights = aiInsights || getStaticAiInsights();

  if (loading) {
    return (
      <Container fluid className="dashboard-container">
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your dashboard...</p>
          {activitiesLoading && (
            <small className="text-muted">Loading real-time activities...</small>
          )}
        </div>
      </Container>
    );
  }

  return (
    <>
      
      <DashboardContent 
        data={data} 
        stats={stats} 
        recentActivity={recentActivity} 
        insights={insights}
        aiLoading={aiLoading}
        activitiesLoading={activitiesLoading}
        onRefreshActivities={handleRefreshActivities}
      />
      <AiChatWidget />
      <DashboardSettings />
    </>
  );
}

// --- DashboardContent stays the same as your version with stat cards and icons ---


// UPDATED: DashboardContent with enhanced activity display and backend integration
const DashboardContent = ({ 
  data, 
  stats, 
  recentActivity, 
  insights, 
  aiLoading, 
  activitiesLoading,
  onRefreshActivities 
}) => {
  const navigate = useNavigate();

  // TEMPORARY DEBUG - Add this
  useEffect(() => {
    console.log("🎯 [DashboardContent] Received stats:", stats);
    console.log("🎯 [DashboardContent] Received activities count:", recentActivity.length);
  }, [stats, recentActivity]);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: <Package size={24} />,
      color: 'primary',
      description: 'In inventory',
      onClick: () => navigate('/products')
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers || 0,
      icon: <Users size={24} />,
      color: 'success',
      description: 'Registered clients',
      onClick: () => navigate('/customers')
    },
    {
      title: 'Monthly Revenue',
      value: `${(stats.monthlyRevenue || 0).toLocaleString()}`,
      icon: <DollarSign size={24} />,
      color: 'warning',
      description: 'IT IS MONTHLY SO AKSEMA POLICY PROHIBIT TRACKING YOUR EARNINGS'
    },
    {
      title: 'Low Stock',
      value: stats.lowStockItems || 0,
      icon: <AlertTriangle size={24} />,
      color: 'danger',
      description: 'Need reorder',
      onClick: () => navigate('/products')
    },
    {
      title: 'Total sales',
      value: stats.totalSales || 0,
      icon: <Truck size={24} />,
      color: 'primary',
      description: 'Completed sales',
      onClick: () => navigate('/receipts')
    },

    {
      title: 'Recent Activities',
      value: recentActivity.length,
      icon: <TrendingUp size={24} />,
      color: 'info',
      description: 'Live tracking'
    },
    {
      title: 'AI Insights',
      value: insights.insights.length,
      icon: <Brain size={24} />,
      color: 'warning',
      description: 'Available',
      onClick: () => document.querySelector('.ai-chat-btn')?.click()
    },
    {
      title: 'Upcoming soon',
      icon: <UserPlus size={24} />,
      color: 'danger',
      description: 'We look forward for your suggestions and feedback email us on aksemainventory@gmail.com',
      
    }
  ];

  const getStatusVariant = (status) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      processing: 'info',
      cancelled: 'danger',
      info: 'info',
      warning: 'warning',
      success: 'success',
      danger: 'danger',
      // Backend activity statuses from your ActivityService
      'Sale Completed': 'success',
      'Stock Alert': 'danger',
      'Product Created': 'info',
      'Product Modified': 'info',
      'Product Deleted': 'danger',
      'Vendor Added': 'info',
      'Vendor Modified': 'info',
      'Vendor Deleted': 'danger',
      'Customer Registered': 'info',
      'Customer Modified': 'info',
      'Customer Deleted': 'danger',
      'Stock Adjusted': 'warning',
      'System': 'info',
      'Setup': 'warning'
    };
    return variants[status] || 'secondary';
  };

  const getActivityIcon = (action) => {
    const icons = {
      'Sale Completed': <ShoppingCart size={16} />,
      'Stock Alert': <AlertTriangle size={16} />,
      'Product Created': <Package size={16} />,
      'Product Modified': <RefreshCw size={16} />,
      'Product Deleted': <AlertTriangle size={16} />,
      'Vendor Added': <Truck size={16} />,
      'Vendor Modified': <RefreshCw size={16} />,
      'Vendor Deleted': <AlertTriangle size={16} />,
      'Customer Registered': <UserPlus size={16} />,
      'Customer Modified': <RefreshCw size={16} />,
      'Customer Deleted': <AlertTriangle size={16} />,
      'Stock Adjusted': <RefreshCw size={16} />,
      'System': <Brain size={16} />,
      'Setup': <AlertTriangle size={16} />,
      'Info': <Brain size={16} />
    };
    return icons[action] || <TrendingUp size={16} />;
  };

  const getPriorityVariant = (priority) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'info'
    };
    return variants[priority] || 'secondary';
  };

  return (
    <Container fluid className="dashboard-container">
      <Row className="mb-4">
        <Col>
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              {data.welcomeMessage || `Dashboard - ${data.user?.companyName || 'Your Company'}`}
            </h1>
            <p className="dashboard-subtitle">
              Real-time business activities and AI-powered insights
            </p>
          </div>
        </Col>
      </Row>

      {/* AI Insights Section */}
      <Row className="mb-4">
        <Col>
          <Card className="ai-insights-card">
            <Card.Header className="card-header-custom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <Brain size={20} className="me-2" />
                AI-Powered Insights
              </h5>
              <div>
                <Badge bg="primary" className="me-2">
                  {aiLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    `Live Analysis`
                  )}
                </Badge>
                <Badge bg={recentActivity.length > 3 ? "success" : "secondary"}>
                  {recentActivity.length} Activities
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                {insights.insights.map((insight) => (
                  <Col md={4} key={insight.id} className="mb-3">
                    <Card className={`insight-card insight-${insight.type} h-100`}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{insight.title}</h6>
                          <Badge bg={getPriorityVariant(insight.priority)} size="sm">
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="insight-description mb-0">{insight.description}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              {/* Quick AI Actions */}
              <div className="mt-3">
                <small className="text-muted d-block mb-2">Quick AI Questions:</small>
                <div className="d-flex flex-wrap gap-2">
                  {insights.quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline-primary"
                      size="sm"
                      className="rounded-pill"
                      onClick={() => {
                        // This will be connected when we make the AI widget interactive
                        console.log('AI Question:', question);
                        // You can connect this to automatically populate the AI chat input
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {statCards.map((stat, index) => (
          <Col xl={2} lg={4} md={6} key={index} className="mb-3">
            <Card 
              className="stat-card h-100" 
              onClick={stat.onClick}
              role={stat.onClick ? 'button' : undefined}
              tabIndex={stat.onClick ? 0 : undefined}
              onKeyDown={stat.onClick ? (e) => e.key === 'Enter' && stat.onClick() : undefined}
              style={stat.onClick ? { cursor: 'pointer' } : {}}
            >
              <Card.Body>
                <div className="stat-header">
                  <div className={`stat-icon stat-icon-${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="stat-numbers">
                    <h3 className="stat-value">{stat.value}</h3>
                    <small className="stat-description">{stat.description}</small>
                  </div>
                </div>
                <h6 className="stat-title">{stat.title}</h6>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col xl={8} lg={7} className="mb-4">
          <Card className="h-100">
            <Card.Header className="card-header-custom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Recent Activity
                {activitiesLoading && (
                  <Spinner animation="border" size="sm" className="ms-2" />
                )}
              </h5>
              <div>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={onRefreshActivities}
                  disabled={activitiesLoading}
                  className="me-2"
                >
                  <RefreshCw size={14} className={activitiesLoading ? "spinning" : ""} />
                </Button>
                <Badge bg="info">
                   Refresh
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="activity-table">
                  <thead>
                    <tr>
                      <th width="40px"></th>
                      <th>Action</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td>
                          <div className="activity-icon">
                            {getActivityIcon(activity.action)}
                          </div>
                        </td>
                        <td>
                          <strong>{activity.action}</strong>
                        </td>
                        <td>{activity.description}</td>
                        <td>
                          <small className="text-muted">{activity.date}</small>
                        </td>
                        <td>
                          <Badge bg={getStatusVariant(activity.status)}>
                            {activity.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {recentActivity.length === 0 && !activitiesLoading && (
                <div className="text-center text-muted py-4">
                  <Package size={48} className="mb-2" />
                  <p>No recent activity</p>
                  <small>Activities will appear here as you add products, vendors, customers, and make sales</small>
                </div>
              )}
              {activitiesLoading && (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading activities from backend...</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={5} className="mb-4">
          <Card className="h-100">
            <Card.Header className="card-header-custom">
              <h5 className="mb-0"> Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="quick-actions">
                <Button variant="outline-secondary" className="w-100 mb-2" href="/products">
                  <Package size={16} className="me-2" />
                  Manage Products
                </Button>
                <Button variant="outline-secondary" className="w-100 mb-2" href="/customers">
                  <Users size={16} className="me-2" />
                  View Customers
                </Button>
                <Button variant="outline-secondary" className="w-100 mb-2" href="/vendors">
                  <Truck size={16} className="me-2" />
                  View Vendors
                </Button>
                <Button variant="outline-secondary" className="w-100 mb-2" href="/receipts">
                  <ShoppingCart size={16} className="me-2" />
                  Create Sale
                </Button>
                <Button 
                  variant="outline-secondary" 
                  className="w-100 mb-2" 
                  onClick={() => document.querySelector('.ai-chat-btn')?.click()}
                >
                  <Brain size={16} className="me-2" />
                  Ask AI Assistant
                </Button>
              </div>
              
              <hr />
              
              <div className="store-summary">
                <h6>Activity Summary</h6>
                <div className="summary-item">
                  <span>Total Activities:</span>
                  <strong>{recentActivity.length}</strong>
                </div>
                <div className="summary-item">
                  <span>Backend Status:</span>
                  <Badge bg="success">Connected</Badge>
                </div>
                <div className="summary-item">
                  <span>Real-time Tracking:</span>
                  <Badge bg="success">Active</Badge>
                </div>
                <div className="summary-item">
                  <span>AI Analysis:</span>
                  <Badge bg="primary">Live</Badge>
                </div>
                <div className="summary-item">
                  <span>Last Updated:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Add spinning animation for refresh icon
const styles = `
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .activity-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background:rgb(86, 16, 16);
    border: 1px solid #dee2e6;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease-in-out;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

DashboardContent.propTypes = {
  data: PropTypes.shape({
    user: PropTypes.shape({
      companyName: PropTypes.string
    }),
    welcomeMessage: PropTypes.string
  }),
  stats: PropTypes.shape({
    totalProducts: PropTypes.number,
    totalCustomers: PropTypes.number,
    totalSales: PropTypes.number,
    lowStockItems: PropTypes.number,
    monthlyRevenue: PropTypes.number,
    pendingOrders: PropTypes.number
  }),
  recentActivity: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      action: PropTypes.string,
      description: PropTypes.string,
      date: PropTypes.string,
      status: PropTypes.string
    })
  ),
  insights: PropTypes.shape({
    insights: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        description: PropTypes.string,
        type: PropTypes.string,
        priority: PropTypes.string
      })
    ),
    quickQuestions: PropTypes.arrayOf(PropTypes.string)
  }),
  aiLoading: PropTypes.bool,
  activitiesLoading: PropTypes.bool,
  onRefreshActivities: PropTypes.func
};

DashboardContent.defaultProps = {
  data: {
    user: { companyName: 'Your Company' },
    welcomeMessage: 'Welcome to your dashboard'
  },
  stats: {
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    lowStockItems: 0,
    monthlyRevenue: 0,
    pendingOrders: 0
  },
  recentActivity: [],
  insights: {
    insights: [],
    quickQuestions: []
  },
  aiLoading: false,
  activitiesLoading: false,
  onRefreshActivities: () => {}
};