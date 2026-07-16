// src/api/api.js
const BASE_URL = 'https://productsinventaksema.zeabur.app';
import { auth } from './firebase';

// 👇 NEW: Helper to get auth token and make fetch request
const fetchWithAuth = async (url, options = {}) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const token = await currentUser.getIdToken();
    console.log('🔐 [fetchWithAuth] Making request to:', url);

      
    let fullUrl;
    if (url.startsWith('http')) {
      fullUrl = url; // Already absolute
    } else {
      // For all API calls, use relative paths starting with /api
      fullUrl = `${BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
    }

    console.log('🔐 [fetchWithAuth] Making request to:', fullUrl);

 
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    if (options.body && typeof options.body !== 'string') {
      config.body = JSON.stringify(options.body);
    } else if (options.body) {
      config.body = options.body;
    }

    const response = await fetch(fullUrl, config);
    console.log('🔐 [fetchWithAuth] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    // Handle non-JSON responses, like for PDF downloads
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response; // Return the response object for non-JSON data
    }
    
  } catch (error) {
    console.error('🔐 [fetchWithAuth] Request failed:', error);
    // Re-throw the error to be caught by the caller
    throw error; 
  }
};

// 👇 AUTH & USER ENDPOINTS
// ✅ ADD THIS FUNCTION: Auto-register users with ALL required MySQL fields
// 👇 AUTH & USER ENDPOINTS
// ✅ ADD THIS FUNCTION: Auto-register users with ALL required MySQL fields
// ✅ ADD export keyword so it can be imported in AuthContext
export const registerUser = async (currentUser) => {
  console.log('👤 [API] User not found in backend, registering...');
  
  // ✅ Provide values for ALL required fields that match your MySQL schema
  const userData = {
    uid: currentUser.uid,
    email: currentUser.email,
    companyName: currentUser.displayName || 'My Business',
    companyAddress: '123 Main Street',        // Required by MySQL
    companyCity: 'New York',                  // Required by MySQL
    companyPhone: '+1-555-0123',              // Required by MySQL
    companyTaxId: 'TAX-ID-PENDING'           // Required by MySQL
  };

  console.log('👤 [API] Registering user with data:', userData);

  try {
    const result = await fetch(`${BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.log('👤 [API] Registration response:', errorText);
      
      // If user already exists (due to race condition), that's fine
      if (errorText.includes('USER_EXISTS') || errorText.includes('EMAIL_EXISTS')) {
        console.log('✅ [API] User already exists in backend');
        return { message: 'User already exists' };
      }
      throw new Error(`Registration failed: ${errorText}`);
    }
    
    const responseData = await result.json();
    console.log('✅ [API] User registered in backend successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('❌ [API] Failed to register user in backend:', error);
    throw error;
  }
};

// ✅ UPDATE: getUserProfile with auto-registration
export const getUserProfile = async () => {
  try {
    return await fetchWithAuth('/api/users/profile');
  } catch (error) {
    if (error.message.includes('USER_NOT_FOUND')) {
      console.log('👤 [API] User profile not found, attempting registration...');
      const currentUser = auth.currentUser;
      if (currentUser) {
        await registerUser(currentUser);
        // Retry getting profile after registration
        return await fetchWithAuth('/api/users/profile');
      }
    }
    throw error;
  }
};

export const fetchUserByUid = (uid) =>
  fetchWithAuth(`${BASE_URL}/api/users/by-uid/${uid}`);

export const healthCheck = () => 
  fetch(`${BASE_URL}/api/users/health`).then(res => res.text());

// 👇 DASHBOARD
export const getDashboardData = () =>
  fetchWithAuth(`${BASE_URL}/api/dashboard`);

// 👇 PRODUCTS — matches ProdrogService + ProductDrogController
export const fetchProducts = () => 
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage`);

// ✅ Fetch product by ID
export const fetchProductById = (id) => 
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage/${id}`);

// ✅ Create product (JSON)
export const createProduct = (product) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage`, {
    method: 'POST',
    body: JSON.stringify(product)
  });

// ✅ Update product (JSON)
export const updateProduct = (id, productData) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });

// ✅ Delete product
export const deleteProduct = (id) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage/${id}`, {
    method: 'DELETE'
  });

// 👇 CUSTOMERS — matches CustomerController
export const fetchCustomers = () => 
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/customerpath`);

export const createCustomer = (customer) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/customerpath`, {
    method: 'POST',
    body: JSON.stringify(customer)
  });

export const deleteCustomer = (id) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/customerpath/${id}`, {
    method: 'DELETE'
  });

// 👇 VENDORS — matches VendorController
export const fetchVendors = () => 
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/vendorpath`);

export const createVendor = (vendor) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/vendorpath`, {
    method: 'POST',
    body: JSON.stringify(vendor)
  });

export const updateVendor = (id, vendorData) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/vendorpath/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vendorData)
  });

export const deleteVendor = (id) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/vendorpath/${id}`, {
    method: 'DELETE'
  });

// 👇 SALES ORDERS (Receipts) — matches ReceiptService + ReceiptController
export const fetchReceipts = () => 
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/receiptpath`);

export const createReceipt = async (orderData) => {
  const itemsToSend = orderData.items.map(item => ({
    productId: item.id,
    quantity: item.quantite
  }));

  const payload = {
    customerName: orderData.customerName,
    orderDate: orderData.orderDate,
    totalPrice: orderData.totalPrice,
    items: itemsToSend
  };

  // ✅ Use the fetchWithAuth helper. It handles the token automatically.
  return fetchWithAuth(`/api/ecom_drog/receiptpath`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// 👇 STOCK ADJUSTMENTS — matches StockAdjustmentService
export const fetchStockAdjustments = () => 
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/stockadjustmentpath`);

export const createStockAdjustment = (adjustment) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/stockadjustmentpath`, {
    method: 'POST',
    body: JSON.stringify(adjustment)
  });

// 👇 PDF receipt download
export const downloadReceiptPdf = (id) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/receiptpath/${id}/pdf`, {
    headers: {
      'Accept': 'application/pdf'
    }
  });


// --- NEW: deleteSale function ---
export const deleteSale = async (id) => {
  // ✅ Also use fetchWithAuth here for consistency.
  return fetchWithAuth(`/api/ecom_drog/receiptpath/${id}`, {
    method: 'DELETE'
  });
};




// 👇 AI ENDPOINTS - FIXED VERSION
export const aiQuery = (prompt, mode = 'assist') =>
  fetchWithAuth(`${BASE_URL}/api/ai/query`, {
    method: 'POST',
    body: JSON.stringify({ prompt, mode })
  });

// 👇 ANALYTICS ENDPOINTS (for dashboard)


// In your api.jsx, update getProducts and getCustomers:

// In api.jsx - FIXED VERSION
export const getProducts = async () => {
  try {
    console.log("🔄 [API] Fetching products...");
    const response = await fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage`);
    
    // Check if we got a valid response
    if (!response) {
      throw new Error('No response received - network error');
    }
    
    console.log("🔄 [API] Products response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✅ [API] Products data received, count:", data.length);
    return data;
  } catch (error) {
    console.error('❌ [API] Error fetching products:', error);
    // Return empty array instead of throwing
    return [];
  }
};

export const getCustomers = async () => {
  try {
    console.log("🔄 [API] Fetching customers...");
    const response = await fetchWithAuth(`${BASE_URL}/api/ecom_drog/customerpath`);
    
    // Check if we got a valid response
    if (!response) {
      throw new Error('No response received - network error');
    }
    
    console.log("🔄 [API] Customers response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✅ [API] Customers data received, count:", data.length);
    return data;
  } catch (error) {
    console.error('❌ [API] Error fetching customers:', error);
    // Return empty array instead of throwing
    return [];
  }
};


/// ✅ Get activity stats (GET)
export const getActivityStats = async () => {
  try {
    console.log("🔄 [API] Calling stats endpoint...");
    const data = await fetchWithAuth(`${BASE_URL}/api/activity/stats`);
    console.log("✅ [API] Stats data received:", data);
    return data;
  } catch (error) {
    console.error("❌ [API] Error in getActivityStats:", error);
    throw error;
  }
};
export const getMonthlyRevenue = (months = 1) =>
  fetchWithAuth(`${BASE_URL}/api/analytics/monthly-revenue?months=${months}`);
export const getTopProducts = (limit = 10, period = '30d') =>
  fetchWithAuth(`${BASE_URL}/api/analytics/top-products?limit=${limit}&period=${period}`);

export const getLowStockAlerts = (threshold = 5) =>
  fetchWithAuth(`${BASE_URL}/api/alerts/low-stock?threshold=${threshold}`);

export const getDemandForecast = (sku, weeks = 8) =>
  fetchWithAuth(`${BASE_URL}/api/forecast/demand?sku=${sku}&weeks=${weeks}`);

// 👇 ACTIVITY ENDPOINTS
export const getRecentActivity = () =>
  fetchWithAuth(`${BASE_URL}/api/activity/recent`);

// ✅ Bulk Import Products (CSV or PDF)
export const bulkImportProducts = async (formDataFile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No authenticated user');

  const token = await currentUser.getIdToken();

  const response = await fetch(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // ❌ don't set Content-Type here; let browser set multipart boundaries automatically
    },
    body: formDataFile
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  return response.json();
};

export const bulkImportCustomers = async (formDataFile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No authenticated user');

  const token = await currentUser.getIdToken();

  const response = await fetch(`${BASE_URL}/api/ecom_drog/customers/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Let browser auto-set Content-Type for multipart
    },
    body: formDataFile
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  return response.json();
};

export const bulkImportSales = async (formDataFile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No authenticated user');

  const token = await currentUser.getIdToken();

  const response = await fetch(`${BASE_URL}/api/ecom_drog/sales/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formDataFile
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  return response.json();
};

export const bulkImportVendors = async (formDataFile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No authenticated user');

  const token = await currentUser.getIdToken();

  const response = await fetch(`${BASE_URL}/api/ecom_drog/vendors/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formDataFile
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  return response.json();
};





// 👇 USER PREFERENCES
// User Profile Endpoints
// Enhanced API functions with better error handling
export const updateUserProfile = async (profileData) => {
  console.log('👤 [API] Updating user profile:', profileData);
  try {
    const result = await fetchWithAuth(`${BASE_URL}/api/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    console.log('✅ [API] User profile updated successfully');
    return result;
  } catch (error) {
    console.error('❌ [API] Failed to update user profile:', error);
    throw error;
  }
};

export const updateUserPassword = async (passwordData) => {
  console.log('🔐 [API] Updating user password');
  try {
    const result = await fetchWithAuth(`${BASE_URL}/api/users/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
    console.log('✅ [API] User password updated successfully');
    return result;
  } catch (error) {
    console.error('❌ [API] Failed to update user password:', error);
    throw error;
  }
};

// 👇 COMPANY ENDPOINTS
export const getCompanyDetails = () =>
  fetchWithAuth(`${BASE_URL}/api/company/details`);

export const updateCompanyDetails = (companyData) =>
  fetchWithAuth(`${BASE_URL}/api/company/details`, {
    method: 'PUT',
    body: JSON.stringify(companyData)
  });



// Add these to your api.js
export const exportData = (type) =>
  fetchWithAuth(`${BASE_URL}/api/export/${type}`);



// Replace these functions in your api.js:


// 👇 DATA EXPORT ENDPOINTS - NEW
export const exportInventory = () =>
  fetchWithAuth(`${BASE_URL}/api/export/inventory`);

export const exportProducts = () =>
  fetchWithAuth(`${BASE_URL}/api/export/products`);

export const exportCustomers = () =>
  fetchWithAuth(`${BASE_URL}/api/export/customers`);

export const exportSales = () =>
  fetchWithAuth(`${BASE_URL}/api/export/sales`);










// FINAL EXPORTS
export { fetchWithAuth, BASE_URL };
