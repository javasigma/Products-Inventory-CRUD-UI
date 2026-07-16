import { auth } from './firebase';

const BASE_URL = 'https://productsinventaksema.zeabur.app';

/**
 * Robustly sanitizes URLs to ensure there are no duplicate slashes (e.g. "//api")
 * while safely preserving the protocol double-slash (e.g. "https://").
 */
const cleanUrl = (url) => {
  if (!url) return url;
  const parts = url.split('://');
  if (parts.length > 1) {
    return parts[0] + '://' + parts.slice(1).join('://').replace(/\/+/g, '/');
  }
  return url.replace(/\/+/g, '/');
};

// 👇 HELPER: Get auth token and make fetch request with automatic URL sanitization
const fetchWithAuth = async (url, options = {}) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const token = await currentUser.getIdToken();
    
    let fullUrl;
    if (url.startsWith('http')) {
      fullUrl = cleanUrl(url); // Sanitizes absolute URLs
    } else {
      // Sanitizes relative paths joined with the base URL
      fullUrl = cleanUrl(`${BASE_URL}${url.startsWith('/') ? url : `/${url}`}`);
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
    throw error; 
  }
};

// 👇 AUTH & USER ENDPOINTS
export const registerUser = async (currentUser) => {
  console.log('👤 [API] User not found in backend, registering...');
  
  const userData = {
    uid: currentUser.uid,
    email: currentUser.email,
    companyName: currentUser.displayName || 'My Business',
    companyAddress: '123 Main Street',
    companyCity: 'New York',
    companyPhone: '+1-555-0123',
    companyTaxId: 'TAX-ID-PENDING'
  };

  console.log('👤 [API] Registering user with data:', userData);

  try {
    const sanitizedUrl = cleanUrl(`${BASE_URL}/api/users/register`);
    const result = await fetch(sanitizedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.log('👤 [API] Registration response:', errorText);
      
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

export const getUserProfile = async () => {
  try {
    return await fetchWithAuth('/api/users/profile');
  } catch (error) {
    if (error.message.includes('USER_NOT_FOUND')) {
      console.log('👤 [API] User profile not found, attempting registration...');
      const currentUser = auth.currentUser;
      if (currentUser) {
        await registerUser(currentUser);
        return await fetchWithAuth('/api/users/profile');
      }
    }
    throw error;
  }
};

export const fetchUserByUid = (uid) =>
  fetchWithAuth(`${BASE_URL}/api/users/by-uid/${uid}`);

export const healthCheck = () => 
  fetch(cleanUrl(`${BASE_URL}/api/users/health`)).then(res => res.text());

// 👇 DASHBOARD
export const getDashboardData = () =>
  fetchWithAuth(`${BASE_URL}/api/dashboard`);

// 👇 PRODUCTS — matches ProdrogService + ProductDrogController
export const fetchProducts = () => 
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage`);

export const fetchProductById = (id) => 
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage/${id}`);

export const createProduct = (product) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage`, {
    method: 'POST',
    body: JSON.stringify(product)
  });

export const updateProduct = (id, productData) =>
  fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });

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

// --- deleteSale function ---
export const deleteSale = async (id) => {
  return fetchWithAuth(`/api/ecom_drog/receiptpath/${id}`, {
    method: 'DELETE'
  });
};

// 👇 AI ENDPOINTS
export const aiQuery = (prompt, mode = 'assist') =>
  fetchWithAuth(`${BASE_URL}/api/ai/query`, {
    method: 'POST',
    body: JSON.stringify({ prompt, mode })
  });

// 👇 ANALYTICS ENDPOINTS
export const getProducts = async () => {
  try {
    console.log("🔄 [API] Fetching products...");
    const response = await fetchWithAuth(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage`);
    if (!response) {
      throw new Error('No response received - network error');
    }
    return response;
  } catch (error) {
    console.error('❌ [API] Error fetching products:', error);
    return [];
  }
};

export const getCustomers = async () => {
  try {
    console.log("🔄 [API] Fetching customers...");
    const response = await fetchWithAuth(`${BASE_URL}/api/ecom_drog/customerpath`);
    if (!response) {
      throw new Error('No response received - network error');
    }
    return response;
  } catch (error) {
    console.error('❌ [API] Error fetching customers:', error);
    return [];
  }
};

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

// Bulk Imports
export const bulkImportProducts = async (formDataFile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No authenticated user');
  const token = await currentUser.getIdToken();
  const sanitizedUrl = cleanUrl(`${BASE_URL}/api/ecom_drog/produitmagasinbricolage/import`);

  const response = await fetch(sanitizedUrl, {
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

export const bulkImportCustomers = async (formDataFile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No authenticated user');
  const token = await currentUser.getIdToken();
  const sanitizedUrl = cleanUrl(`${BASE_URL}/api/ecom_drog/customers/import`);

  const response = await fetch(sanitizedUrl, {
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

export const bulkImportSales = async (formDataFile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No authenticated user');
  const token = await currentUser.getIdToken();
  const sanitizedUrl = cleanUrl(`${BASE_URL}/api/ecom_drog/sales/import`);

  const response = await fetch(sanitizedUrl, {
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
  const sanitizedUrl = cleanUrl(`${BASE_URL}/api/ecom_drog/vendors/import`);

  const response = await fetch(sanitizedUrl, {
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

export const exportData = (type) =>
  fetchWithAuth(`${BASE_URL}/api/export/${type}`);

// 👇 DATA EXPORT ENDPOINTS
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
