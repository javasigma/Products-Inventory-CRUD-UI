// src/components/DashboardSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Tabs,
  Tab,
  ProgressBar
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getUserProfile,
  getCompanyDetails,
  updateCompanyDetails,
  //bulkImportProducts,
  updateUserPassword,
  createProduct,
  createCustomer,
  createVendor,
  createReceipt
} from '../api/api';
import './DashboardSettings.css';
import Papa from 'papaparse';

const DashboardSettings = ({ initialTab = 'company' }) => { // ✅ Changed default to 'company'
  const location = useLocation();
  const isPage = location.pathname === '/dashboard';

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [importEntity, setImportEntity] = useState('products');
  const [importStats, setImportStats] = useState({ success: 0, failed: 0, errors: [] });
  
  // Theme state
  const [darkMode, setDarkMode] = useState(true);

  // Loading and alert states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);


  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Company details state
  const [company, setCompany] = useState({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyPhone: '',
    companyTaxId: ''
  });

  const productExample = `"Laptop Dell","Gaming Laptop","Dell","ABC Tech","10","1299.99"`;
  const customerExample = `"Jean Dupont","+33 1 23 45 67 89","123 Paris","ACTIVE","5000.00","1250.75","Good customer"`;
  const vendorExample = `"ABC Electronics","John Smith","+33 1 23 45 67 89","ACTIVE","7","1000.00","Reliable"`;
  const receiptExample = `"Jean Dupont","2024-01-15","1299.99","[{""productId"":1,""quantity"":1}]"`
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    setDarkMode(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  // Update theme when darkMode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load user & company data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      console.log('🔄 [DashboardSettings] Loading user data...');
      const userData = await getUserProfile();
      console.log('✅ [DashboardSettings] User profile loaded:', userData);

      if (userData) {
        try {
          console.log('🔄 [DashboardSettings] Loading company details...');
          const companyData = await getCompanyDetails();
          console.log('✅ [DashboardSettings] Company details loaded from backend:', companyData);
          
          // ✅ FIXED DATA MAPPING: Correctly maps backend fields to frontend state
          setCompany({
            companyName: companyData.name || userData.companyName || '',
            companyAddress: companyData.address || userData.companyAddress || '',
            companyCity: companyData.city || userData.companyCity || '',
            companyPhone: companyData.phone || userData.companyPhone || '',
            companyTaxId: companyData.taxId || userData.companyTaxId || ''
          });
          
          console.log('✅ [DashboardSettings] Company state set:', {
            companyName: companyData.name || userData.companyName || '',
            companyAddress: companyData.address || userData.companyAddress || '',
            companyCity: companyData.city || userData.companyCity || '',
            companyPhone: companyData.phone || userData.companyPhone || '',
            companyTaxId: companyData.taxId || userData.companyTaxId || ''
          });
          
        } catch (companyError) {
          console.warn('⚠️ [DashboardSettings] Company details not available:', companyError);
          // Fallback to user profile data for company info
          setCompany({
            companyName: userData.companyName || '',
            companyAddress: userData.companyAddress || '',
            companyCity: userData.companyCity || '',
            companyPhone: userData.companyPhone || '',
            companyTaxId: userData.companyTaxId || ''
          });
        }
      }
    } catch (error) {
      console.error('❌ [DashboardSettings] Error loading user data:', error);
      showAlert(`Failed to load user data: ${error.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  const toggleDark = () => setDarkMode(!darkMode);


/*✅ Handle Bulk Import
const handleBulkImport = async () => {
  if (!importFile) {
    showAlert('Please select a CSV file to import.', 'warning');
    return;
  }

  setImportLoading(true);
  setImportProgress(0);
  setImportResult(null);
  
  try {
    // Create FormData and append file
    const formData = new FormData();
    formData.append('file', importFile);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 80) {
          clearInterval(progressInterval);
          return 80;
        }
        return prev + 20;
      });
    }, 300);

    // Call the import API
    console.log('🔄 Starting CSV import...', importFile.name);
    const result = await bulkImportProducts(formData);
    
    clearInterval(progressInterval);
    setImportProgress(100);
    
    // Handle success result
    console.log('✅ Import successful:', result);
    setImportResult({
      success: true,
      message: `Successfully imported ${result.importedCount || 'multiple'} products from your CSV file!`,
      details: result
    });
    
    showAlert(`Successfully imported ${result.importedCount || 'multiple'} products!`, 'success');
    
    // Reset file input after successful import
    setTimeout(() => {
      setImportFile(null);
      setImportProgress(0);
      document.getElementById('import-file-input').value = '';
    }, 2000);

  } catch (error) {
    console.error('❌ CSV import error:', error);
    setImportResult({
      success: false,
      message: `Import failed: ${error.message || 'Please check your CSV format and try again.'}`
    });
    showAlert(`Import failed: ${error.message}`, 'danger');
  } finally {
    setImportLoading(false);
  }
};*/

// ✅ Enhanced CSV Template Download
const downloadTemplate = () => {
  let templateData = [];
  let filename = '';

  switch (importEntity) {
    case 'products':
      templateData = [
        ['nom', 'designation', 'marque', 'fournisseur', 'quantite', 'prixtva'],
        ['Laptop Dell', 'Gaming Laptop 16GB', 'Dell', 'ABC Tech', '10', '1299.99'],
        ['Wireless Mouse', 'Ergonomic Wireless Mouse', 'Logitech', 'Tech Supplier', '25', '49.99'],
        ['','','','','',''] // Empty row for user to fill
      ];
      filename = 'product_import_template.csv';
      break;
    
    case 'customers':
      templateData = [
        ['name', 'phone', 'address', 'status', 'creditLimit', 'outstandingBalance', 'notes'],
        ['Jean Dupont', '+33 1 23 45 67 89', '123 Rue de Paris', 'ACTIVE', '5000.00', '1250.75', 'Good customer'],
        ['Marie Martin', '+33 1 34 56 78 90', '456 Avenue des Champs', 'ACTIVE', '3000.00', '0.00', 'Regular client'],
        ['','','','','','','']
      ];
      filename = 'customer_import_template.csv';
      break;
    
    case 'vendors':
      templateData = [
        ['name', 'contactPerson', 'phone', 'status', 'leadTimeDays', 'minimumOrderValue', 'notes'],
        ['ABC Electronics', 'John Smith', '+33 1 23 45 67 89', 'ACTIVE', '7', '1000.00', 'Reliable supplier'],
        ['Tech Parts Inc', 'Sarah Johnson', '+33 1 34 56 78 90', 'ACTIVE', '5', '500.00', 'Fast delivery'],
        ['','','','','','','']
      ];
      filename = 'vendor_import_template.csv';
      break;
    
    case 'receipts':
      templateData = [
        ['customerName', 'orderDate', 'totalPrice', 'items'],
        ['Jean Dupont', '2024-01-15', '1299.99', '[{"productId":1,"quantity":1}]'],
        ['Marie Martin', '2024-01-16', '149.98', '[{"productId":2,"quantity":3}]'],
        ['','','','']
      ];
      filename = 'receipt_import_template.csv';
      break;
  }

  const csv = templateData.map(row => 
    row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showAlert(`${importEntity.charAt(0).toUpperCase() + importEntity.slice(1)} template downloaded!`, 'success');
};

// ✅ Frontend CSV Parser and Importer
const handleFrontendCSVImport = async () => {
  if (!importFile) {
    showAlert('Please select a CSV file to import.', 'warning');
    return;
  }

  setImportLoading(true);
  setImportProgress(0);
  setImportStats({ success: 0, failed: 0, errors: [] });
  setImportResult(null);

  try {
    const text = await readFileAsText(importFile);
    
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length > 0) {
          throw new Error(`CSV parsing error: ${results.errors[0].message}`);
        }

        const rows = results.data;
        if (rows.length === 0) {
          throw new Error('CSV file is empty or contains no data');
        }

        await processCSVData(rows);
      },
      error: (error) => {
        throw new Error(`CSV parsing failed: ${error.message}`);
      }
    });

  } catch (error) {
    console.error('❌ CSV import error:', error);
    setImportResult({
      success: false,
      message: `Import failed: ${error.message}`
    });
    showAlert(`Import failed: ${error.message}`, 'danger');
    setImportLoading(false);
  }
};

// ✅ Helper function to read file as text
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new e.targetError('Failed to read file'));
    reader.readAsText(file);
  });
};

// ✅ Process CSV data and make individual API calls
const processCSVData = async (rows) => {
  const stats = { success: 0, failed: 0, errors: [] };
  const totalRows = rows.length;

  for (let i = 0; i < totalRows; i++) {
    try {
      const row = rows[i];
      await processSingleRow(row, importEntity);
      stats.success++;
      
      // Update progress
      setImportProgress(Math.round(((i + 1) / totalRows) * 100));
      
    } catch (error) {
      stats.failed++;
      stats.errors.push(`Row ${i + 1}: ${error.message}`);
      console.error(`Failed to import row ${i + 1}:`, error);
    }
  }

  // Final results
  setImportStats(stats);
  setImportResult({
    success: stats.failed === 0,
    message: `Import completed! Success: ${stats.success}, Failed: ${stats.failed}`,
    details: stats
  });
  
  showAlert(`Import completed! ${stats.success} successful, ${stats.failed} failed`, 
    stats.failed === 0 ? 'success' : 'warning');
  
  setImportLoading(false);
};

// ✅ Process single row based on entity type
const processSingleRow = async (row, entityType) => {
  switch (entityType) {
    case 'products':
      return await processProductRow(row);
    case 'customers':
      return await processCustomerRow(row);
    case 'vendors':
      return await processVendorRow(row);
    case 'receipts':
      return await processReceiptRow(row);
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
};

// ✅ Process Product Row
const processProductRow = async (row) => {
  // Validate required fields
  if (!row.nom || !row.designation) {
    throw new Error('Missing required fields: nom and designation are required');
  }

  const productData = {
    nom: row.nom.trim(),
    designation: row.designation.trim(),
    marque: row.marque?.trim() || '',
    fournisseur: row.fournisseur?.trim() || '',
    quantite: parseInt(row.quantite) || 0,
    prixtva: parseFloat(row.prixtva) || 0
  };

  // Validate numeric fields
  if (isNaN(productData.quantite)) {
    throw new Error('Invalid quantity format');
  }
  if (isNaN(productData.prixtva)) {
    throw new Error('Invalid price format');
  }

  await createProduct(productData);
};

// ✅ Process Customer Row
const processCustomerRow = async (row) => {
  if (!row.name) {
    throw new Error('Missing required field: name');
  }

  const customerData = {
    name: row.name.trim(),
    phone: row.phone?.trim() || '',
    address: row.address?.trim() || '',
    status: row.status?.trim() || 'ACTIVE',
    creditLimit: parseFloat(row.creditLimit) || 0,
    outstandingBalance: parseFloat(row.outstandingBalance) || 0,
    notes: row.notes?.trim() || ''
  };

  await createCustomer(customerData);
};

// ✅ Process Vendor Row
const processVendorRow = async (row) => {
  if (!row.name) {
    throw new Error('Missing required field: name');
  }

  const vendorData = {
    name: row.name.trim(),
    contactPerson: row.contactPerson?.trim() || '',
    phone: row.phone?.trim() || '',
    status: row.status?.trim() || 'ACTIVE',
    leadTimeDays: parseInt(row.leadTimeDays) || 0,
    minimumOrderValue: parseFloat(row.minimumOrderValue) || 0,
    notes: row.notes?.trim() || ''
  };

  await createVendor(vendorData);
};

// ✅ Process Receipt Row
const processReceiptRow = async (row) => {
  if (!row.customerName || !row.orderDate) {
    throw new Error('Missing required fields: customerName and orderDate');
  }

  let items = [];
  try {
    if (row.items) {
      items = JSON.parse(row.items);
    }
  } catch (error) {
    throw new Error('Invalid items format - must be valid JSON array');
  }

  const receiptData = {
    customerName: row.customerName.trim(),
    orderDate: row.orderDate + 'T00:00:00', // Add time component for LocalDateTime
    totalPrice: parseFloat(row.totalPrice) || 0,
    items: items
  };

  await createReceipt(receiptData);
};

// ✅ Enhanced File Selection Handler
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file type
    const allowedTypes = [
      'text/csv', 
      'application/vnd.ms-excel',
      'application/csv',
      'text/plain'
    ];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && fileExtension !== 'csv') {
      showAlert('Please select a CSV file only.', 'danger');
      e.target.value = ''; // Clear the input
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showAlert('File size must be less than 10MB.', 'danger');
      e.target.value = '';
      return;
    }
    
    setImportFile(file);
    setImportResult(null);
    setImportProgress(0);
    setImportStats({ success: 0, failed: 0, errors: [] });
    showAlert(`File "${file.name}" selected and ready for import.`, 'info');
  }
};


  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Sign-out error:', error);
      showAlert('Error signing out. Please try again.', 'danger');
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
  };
  const handlePasswordChange = (field, value) =>
    setPasswords(prev => ({ ...prev, [field]: value }));
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwords.newPassword !== passwords.confirmPassword) {
      showAlert('New password and confirmation do not match.', 'danger');
      return;
    }

    if (passwords.newPassword.length < 6) {
      showAlert('New password must be at least 6 characters long.', 'warning');
      return;
    }

    setSaving(true);
    try {
      // Use the backend API for password updates
      const passwordData = {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
        // confirmPassword is typically validated on frontend, but you can include if backend expects it
      };

      await updateUserPassword(passwordData);
      showAlert('Password updated successfully!');
      
      // Clear password fields
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password update error:', error);
      let errorMessage = 'Failed to update password.';
      
      // Handle different error types from backend
      if (error.message.includes('Current password is incorrect')) {
        errorMessage = 'Current password is incorrect.';
      } else if (error.message.includes('weak') || error.message.includes('Weak password')) {
        errorMessage = 'New password is too weak. Please use a stronger password.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
        errorMessage = 'Invalid password format. Please check your input.';
      }
      
      showAlert(errorMessage, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleCompanyChange = (field, value) => {
    console.log(`🔄 [DashboardSettings] Changing ${field} to:`, value);
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanySave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      console.log('🔄 [DashboardSettings] Saving company details:', company);
      
      // ✅ PROPER DATA TRANSFORMATION: Transforms frontend state to backend expected format
      const backendCompanyData = {
        name: company.companyName,
        address: company.companyAddress,
        city: company.companyCity,
        phone: company.companyPhone,
        taxId: company.companyTaxId
      };
      
      console.log('🔄 [DashboardSettings] Sending to backend:', backendCompanyData);
      await updateCompanyDetails(backendCompanyData);
      
      console.log('✅ [DashboardSettings] Company details updated successfully');
      showAlert('Company details updated successfully!');
    } catch (error) {
      console.error('❌ [DashboardSettings] Company update error:', error);
      showAlert(`Failed to update company details: ${error.message}`, 'danger');
    } finally {
      setSaving(false);
    }
  };

  // 🟢 LOADING STATE
  if (loading) {
    return (
      <Container className="dashboard-settings-loading">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted">Loading your settings...</p>
      </Container>
    );
  }

  // 🟢 EXTRACT REUSABLE SETTINGS CONTENT
  const settingsContent = (
    <Card className="dashboard-settings-card">
      <Card.Body>
        <Tabs defaultActiveKey={initialTab} className="mb-4 dashboard-settings-tabs">
          {/* ✅ Company Tab - MOVED TO FIRST POSITION with better UX */}
          <Tab
            eventKey="company"
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="fas fa-building"></i> Company Details
              </span>
            }
          >
            <h5 className="mb-4">Company Details</h5>
            {/* ✅ ADDED HELPFUL DESCRIPTION */}
            <p className="text-muted mb-4">
              Update your company information. Changes are automatically saved to your account.
            </p>
            
            <Form onSubmit={handleCompanySave} className="dashboard-settings-form">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={company.companyName}
                      onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                      placeholder="e.g., ABC Pharma Inc."
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tax ID / Registration Number *</Form.Label>
                    <Form.Control
                      type="text"
                      value={company.companyTaxId}
                      onChange={(e) => handleCompanyChange('companyTaxId', e.target.value)}
                      placeholder="e.g., 12345678"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Company Address *</Form.Label>
                <Form.Control
                  type="text"
                  value={company.companyAddress}
                  onChange={(e) => handleCompanyChange('companyAddress', e.target.value)}
                  placeholder="e.g., 123 Business Ave, Downtown"
                  required
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City *</Form.Label>
                    <Form.Control
                      type="text"
                      value={company.companyCity}
                      onChange={(e) => handleCompanyChange('companyCity', e.target.value)}
                      placeholder="e.g., Casablanca"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control
                      type="tel"
                      value={company.companyPhone}
                      onChange={(e) => handleCompanyChange('companyPhone', e.target.value)}
                      placeholder="e.g., +212 6 XX XX XX XX"
                      required
                    />
                    {/* ✅ ADDED HELPFUL TEXT */}
                    <Form.Text className="text-muted">
                      Include country code for international calls
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* ✅ ADDED RESET BUTTON and improved button layout */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  variant="outline-secondary"
                  onClick={() => loadUserData()} // Reset form
                  disabled={saving}
                  className="dashboard-settings-btn"
                >
                  <i className="fas fa-undo"></i> Reset
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={saving}
                  className="dashboard-settings-btn"
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" /> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Company Details
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Tab>

          {/* Profile Tab - PASSWORD MANAGEMENT */}
          <Tab
            eventKey="profile"
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="fas fa-lock"></i> Password Settings
              </span>
            }
          >
            <h5 className="mb-4">Password Management</h5>
            {/* ✅ ADDED HELPFUL DESCRIPTION */}
            <p className="text-muted mb-4">
              Change your account password. You will need to provide your current password for security.
            </p>
            
            <Form onSubmit={handlePasswordSave} className="dashboard-settings-form">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwords.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                        required
                      />
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="position-absolute end-0 top-0 h-100 rounded-start-0 border-start-0"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{ zIndex: 2 }}
                      >
                        <i className={showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showNewPassword ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="position-absolute end-0 top-0 h-100 rounded-start-0 border-start-0"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ zIndex: 2 }}
                      >
                        <i className={showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters long
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwords.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="position-absolute end-0 top-0 h-100 rounded-start-0 border-start-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ zIndex: 2 }}
                      >
                        <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={saving || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                  className="dashboard-settings-btn"
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" /> Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key"></i> Update Password
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Tab>

          {/* Data Management Tab */}
{/* Data Management Tab */}
<Tab
  eventKey="data"
  title={
    <span className="d-flex align-items-center gap-2">
      <i className="fas fa-database"></i> Data Management
    </span>
  }
>
  <h5 className="mb-4">Data Management</h5>
  
  {/* ✅ Entity Selection */}
  <Card className="mb-4">
    <Card.Header className="bg-primary text-white">
      <h6 className="mb-0">
        <i className="fas fa-cubes me-2"></i>
        Bulk Import Data
      </h6>
    </Card.Header>
    <Card.Body>
      <Form.Group className="mb-3">
        <Form.Label>Select Data Type to Import</Form.Label>
        <Form.Select
          value={importEntity}
          onChange={(e) => setImportEntity(e.target.value)}
          disabled={importLoading}
        >
          <option value="products">📦 Products</option>
          <option value="customers">👥 Customers</option>
          <option value="vendors">🏢 Vendors</option>
          <option value="receipts">🧾 Receipts/Sales</option>
        </Form.Select>
        <Form.Text className="text-muted">
          Choose the type of data you want to import from your CSV file
        </Form.Text>
      </Form.Group>

      {/* File Upload Area */}
      <div 
        className={`file-upload-area border-dashed p-4 text-center mb-3 ${importFile ? 'file-selected' : ''}`}
        style={{
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          backgroundColor: importFile ? '#f8f9fa' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => document.getElementById('import-file-input').click()}
      >
        <input
          id="import-file-input"
          type="file"
          accept=".csv,.txt"
          onChange={handleFileSelect}
          disabled={importLoading}
          style={{ display: 'none' }}
        />
        
        {!importFile ? (
          <>
            <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
            <p className="mb-1">Click to select CSV file or drag and drop</p>
            <small className="text-muted">Supported format: CSV (Max 10MB)</small>
          </>
        ) : (
          <>
            <i className="fas fa-file-csv fa-2x text-success mb-2"></i>
            <p className="mb-1 fw-bold">{importFile.name}</p>
            <small className="text-muted">
              Size: {(importFile.size / 1024 / 1024).toFixed(2)} MB • 
              Ready to import {importEntity}
            </small>
          </>
        )}
      </div>

      {/* File Actions */}
      {importFile && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-check-circle text-success me-2"></i>
            <span>File selected: <strong>{importFile.name}</strong> for {importEntity}</span>
          </div>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              setImportFile(null);
              setImportResult(null);
              setImportProgress(0);
              document.getElementById('import-file-input').value = '';
            }}
            disabled={importLoading}
          >
            <i className="fas fa-times"></i> Remove
          </Button>
        </div>
      )}

      {/* CSV Format Guide */}
      <Card className="bg-light">
        <Card.Body>
          <h6 className="mb-2">
            <i className="fas fa-info-circle me-1"></i>
            {importEntity.charAt(0).toUpperCase() + importEntity.slice(1)} CSV Format
          </h6>
          <small className="text-muted">
            Your CSV file should contain these columns:
          </small>
          <div className="mt-2">
          {importEntity === 'products' && (
  <>
    <code className="d-block mb-1">
      <strong>Required:</strong> nom, designation, marque, fournisseur, quantite, prixtva
    </code>
    <code className="d-block text-muted small">
  <strong>Example:</strong> {productExample}
</code>
  </>
)}
{importEntity === 'customers' && (
  <>
    <code className="d-block mb-1">
      <strong>Required:</strong> name, phone, address, status, creditLimit, outstandingBalance, notes
    </code>
    <code className="d-block text-muted small">
  <strong>Example:</strong> {customerExample}
</code>
  </>
)}
{importEntity === 'vendors' && (
  <>
    <code className="d-block mb-1">
      <strong>Required:</strong> name, contactPerson, phone, status, leadTimeDays, minimumOrderValue, notes
    </code>
    <code className="d-block text-muted small">
  <strong>Example:</strong> {vendorExample}
</code>
  </>
)}
{importEntity === 'receipts' && (
  <>
    <code className="d-block mb-1">
      <strong>Required:</strong> customerName, orderDate, totalPrice, items
    </code>
    <code className="d-block text-muted small">
  <strong>Example:</strong> {receiptExample}
</code>
  </>
)}
          </div>
        </Card.Body>
      </Card>

      {/* Progress Bar */}
      {importLoading && (
        <div className="mb-3 mt-3">
          <div className="d-flex justify-content-between mb-1">
            <small>
              {importProgress < 100 ? `Importing ${importEntity}...` : 'Import completed!'}
            </small>
            <small>{importProgress}%</small>
          </div>
          <ProgressBar 
            now={importProgress} 
            variant={importProgress === 100 ? 'success' : 'primary'}
            animated={importProgress < 100}
            style={{ height: '8px' }}
          />
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <Alert 
          variant={importResult.success ? 'success' : 'warning'}
          className="mt-3"
        >
          <div className="d-flex align-items-center">
            <i className={`fas ${importResult.success ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
            <div className="flex-grow-1">
              <strong>{importResult.success ? 'Import Successful!' : 'Import Completed with Issues'}</strong>
              <div className="mt-1">{importResult.message}</div>
              {importStats.errors.length > 0 && (
                <div className="mt-2">
                  <small>
                    <strong>Errors:</strong>
                    <ul className="mb-0 mt-1 small">
                      {importStats.errors.slice(0, 3).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {importStats.errors.length > 3 && (
                        <li>... and {importStats.errors.length - 3} more errors</li>
                      )}
                    </ul>
                  </small>
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-2 flex-wrap mt-4">
        <Button
          variant="outline-primary"
          onClick={downloadTemplate}
          disabled={importLoading}
          className="dashboard-settings-btn"
        >
          <i className="fas fa-download me-1"></i>
          Download {importEntity.charAt(0).toUpperCase() + importEntity.slice(1)} Template
        </Button>
        
        <Button
          variant="primary"
          onClick={handleFrontendCSVImport}
          disabled={!importFile || importLoading}
          className="dashboard-settings-btn flex-grow-1"
        >
          {importLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Importing {importEntity}...
            </>
          ) : (
            <>
              <i className="fas fa-upload me-1"></i>
              Import {importEntity.charAt(0).toUpperCase() + importEntity.slice(1)} from CSV
            </>
          )}
        </Button>
      </div>
    </Card.Body>
  </Card>

  {/* ✅ Quick Actions */}
  <Card>
    <Card.Header className="bg-secondary text-white">
      <h6 className="mb-0">
        <i className="fas fa-bolt me-2"></i>
        Quick Actions
      </h6>
    </Card.Header>
    <Card.Body>
      <Row>
        <Col md={3}>
          <div className="d-grid gap-2">
            <Button
              variant="outline-success"
              onClick={() => navigate('/products')}
              className="dashboard-settings-btn"
            >
              <i className="fas fa-boxes me-1"></i>
              View Products
            </Button>
          </div>
        </Col>
        <Col md={3}>
          <div className="d-grid gap-2">
            <Button
              variant="outline-info"
              onClick={() => navigate('/customers')}
              className="dashboard-settings-btn"
            >
              <i className="fas fa-users me-1"></i>
              View Customers
            </Button>
          </div>
        </Col>
        <Col md={3}>
          <div className="d-grid gap-2">
            <Button
              variant="outline-warning"
              onClick={() => navigate('/vendors')}
              className="dashboard-settings-btn"
            >
              <i className="fas fa-building me-1"></i>
              View Vendors
            </Button>
          </div>
        </Col>
        <Col md={3}>
          <div className="d-grid gap-2">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/receipts')}
              className="dashboard-settings-btn"
            >
              <i className="fas fa-receipt me-1"></i>
              View Receipts
            </Button>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
</Tab>

          {/* Theme Tab */}
          <Tab
            eventKey="theme"
            title={
              <span className="d-flex align-items-center gap-2">
                <i className="fas fa-palette"></i> Theme
              </span>
            }
          >
            <h5 className="mb-4">Theme Management</h5>
            <Card>
              <Card.Body className="theme-switch-transition">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Current Theme</h6>
                    <p className="text-muted mb-0">
                      You are currently using {darkMode ? 'dark' : 'light'} mode.
                    </p>
                  </div>
                  <Button
                    variant="outline-primary"
                    onClick={toggleDark}
                    className="dashboard-settings-btn"
                  >
                    {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                    Switch to {darkMode ? 'Light' : 'Dark'} Mode
                  </Button>
                </div>
                <hr className="my-4" />
                <div className="row">
                  <div className="col-md-6">
                    <div
                      className={`p-4 rounded border theme-toggle-card ${!darkMode ? 'active' : ''}`}
                      style={{ 
                        backgroundColor: '#FFF8DC', 
                        color: '#8B4513', 
                        cursor: 'pointer',
                        border: `2px solid ${!darkMode ? '#FF8C00' : '#FFA500'}`
                      }}
                      onClick={() => !darkMode && toggleDark()}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <strong>Light Theme</strong>
                        {!darkMode && <span className="badge bg-primary">Active</span>}
                      </div>
                      <small className="text-muted">Clean and bright interface for daytime use</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className={`p-4 rounded border theme-toggle-card ${darkMode ? 'active' : ''}`}
                      style={{ 
                        backgroundColor: '#8B7355', 
                        color: '#FFF8DC', 
                        cursor: 'pointer',
                        border: `2px solid ${darkMode ? '#FF8C00' : '#FFA500'}`
                      }}
                      onClick={() => darkMode && toggleDark()}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <strong>Dark Theme</strong>
                        {darkMode && <span className="badge bg-primary">Active</span>}
                      </div>
                      <small className="text-muted">Easy on the eyes for nighttime work sessions</small>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );

  // 🟢 PAGE MODE: Full layout with sidebar (theme + sign out)
  if (isPage) {
    return (
      <Container fluid className="dashboard-settings-container py-4 theme-switch-transition">
        {/* Alert Banner */}
        {alert.show && (
          <Alert variant={alert.variant} className="mb-4 dashboard-settings-alert">
            {alert.message}
          </Alert>
        )}

        {/* Header - CHANGED TO OUTLINE-WARNING AND HOMEPAGE TEXT */}
        <div className="mb-4 dashboard-settings-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-bold mb-0">Dashboard Settings</h4>
              <p className="text-muted mb-0">Manage your account and preferences</p>
            </div>
            <Button
              variant="outline-warning" // CHANGED TO OUTLINE-WARNING
              onClick={() => navigate('/')}
              className="dashboard-settings-btn"
            >
              <i className="fas fa-home me-1"></i> Back to Homepage {/* UPDATED TEXT */}
            </Button>
          </div>
        </div>

        <Row>
          {/* Left Sidebar: Theme + Quick Actions */}
          <Col lg={3} className="mb-4 dashboard-settings-sidebar">
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 fw-semibold">Theme</h6>
                    <small className="text-muted">Switch between dark and light mode</small>
                  </div>
                  <Button
                    variant="outline-primary"
                    onClick={toggleDark}
                    className="dashboard-settings-btn"
                  >
                    {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                    {darkMode ? ' Light Mode' : ' Dark Mode'}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body className="dashboard-settings-quick-actions">
                <h6 className="fw-semibold mb-3">Quick Actions</h6>
                <Button
                  variant="outline-danger"
                  onClick={handleSignOut}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 dashboard-settings-btn"
                >
                  <i className="fas fa-sign-out-alt"></i> Sign Out
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col lg={9}>{settingsContent}</Col>
        </Row>

        {/* ADDED HARD-CODED SIGN OUT BUTTON AT BOTTOM */}
        <Row className="mt-4">
          <Col>
            <div className="text-center">
              <Button
                variant="outline-warning"
                onClick={handleSignOut}
                className="dashboard-settings-btn px-4 py-2"
              >
                <i className="fas fa-sign-out-alt me-2"></i> Sign Out
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // 🟢 EMBEDDED MODE: Only the settings form (e.g., for modals or sidebars)
  return settingsContent;
};

// ✅ Prop validation
DashboardSettings.propTypes = {
  initialTab: PropTypes.string
};

DashboardSettings.defaultProps = {
  initialTab: 'company' // ✅ Changed default to company tab
};

export default DashboardSettings;