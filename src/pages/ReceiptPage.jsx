// src/pages/ReceiptPage.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { fetchReceipts, createReceipt, fetchProducts, downloadReceiptPdf, fetchCustomers, deleteSale } from '../api/api';
import './ReceiptPage.css';
import { useNavigate } from 'react-router-dom';

const ReceiptPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    totalPrice: 0,
    orderDate: new Date().toISOString().split('T')[0],
    items: []
  });
  
  // --- NEW: handleDeleteSale function ---
  const handleDeleteSale = async (saleId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
        try {
            // The API call is here
            await deleteSale(saleId); 
            loadReceipts();
            alert("Commande supprimée avec succès.");
        } catch (err) {
            alert(`Erreur lors de la suppression: ${err.message}`);
        }
    }
};

  // Selection states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    loadReceipts();
    loadProducts();
    loadCustomers();
  }, []);

  const loadReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReceipts();
      setReceipts(data);
    } catch (err) {
      setError(err.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) return;

    const selectedProduct = products.find(p => p.id == selectedProductId);
    if (!selectedProduct) return;
    
    // --- START: New validation logic ---
    const existingItem = formData.items.find(item => item.id == selectedProductId);
    const quantityInCart = existingItem ? existingItem.quantite : 0;
    const totalRequestedQuantity = quantityInCart + selectedQuantity;

    if (totalRequestedQuantity > selectedProduct.quantite) {
      const remainingStock = selectedProduct.quantite - quantityInCart;
      alert(`Quantité demandée (${totalRequestedQuantity}) dépasse le stock disponible pour ${selectedProduct.nom}. Stock restant: ${remainingStock}.`);
      return;
    }
    // --- END: New validation logic ---

    const existingItemIndex = formData.items.findIndex(item => item.id == selectedProductId);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantite += selectedQuantity;
      
      setFormData({
        ...formData,
        items: updatedItems,
        totalPrice: formData.totalPrice + (parseFloat(selectedProduct.prixtva) * selectedQuantity || 0)
      });
    } else {
      // Add new item
      setFormData({
        ...formData,
        items: [...formData.items, {
          id: selectedProduct.id,
          nom: selectedProduct.nom,
          prixtva: selectedProduct.prixtva,
          quantite: selectedQuantity
        }],
        totalPrice: formData.totalPrice + (parseFloat(selectedProduct.prixtva) * selectedQuantity || 0)
      });
    }
    
    // Reset selection
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const removedItem = formData.items[index];
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
      totalPrice: formData.totalPrice - (parseFloat(removedItem.prixtva) * removedItem.quantite)
    });
  };

  const handleCreate = async () => {
    // This validation is still useful for immediate feedback
    if (!formData.customerId || formData.items.length === 0) {
      setError("Veuillez sélectionner un client et au moins un article.");
      return;
    }
    try {
      const selectedCustomer = customers.find(c => c.id == formData.customerId);
      if (!selectedCustomer) {
        setError("Please select a valid customer");
        return;
      }

      // The payload is now correctly structured inside createReceipt API call
      await createReceipt({
        customerName: selectedCustomer.name,
        orderDate: formData.orderDate + 'T00:00:00', // Backend expects LocalDateTime
        totalPrice: formData.totalPrice,
        items: formData.items // Pass the full item array, the API will transform it
      });
      
      // ... rest of the reset and closeModal logic ...
      setFormData({
        customerId: '',
        totalPrice: 0,
        orderDate: new Date().toISOString().split('T')[0],
        items: []
      });
      setSelectedProductId('');
      setSelectedQuantity(1);
      setShowModal(false);
      loadReceipts();
    } catch (err) {
      // This will now catch the detailed error from the backend (e.g., "Insufficient stock...")
      setError(err.message);
    }
  };

  const handlePreviewPdf = async (id) => {
    try {
      const response = await downloadReceiptPdf(id);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setSelectedReceiptId(id);
      setShowPreview(true);
    } catch (err) {
      alert('Erreur lors de la génération du reçu: ' + err.message);
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      const response = await downloadReceiptPdf(id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reçu_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement: ' + err.message);
    }
  };

  const formatPrice = (price) => {
    if (price == null || price === '' || isNaN(Number(price))) {
      return '—';
    }
    const num = Number(price);
    if (isNaN(num)) return '—';
    return `$${num.toFixed(2)}`;
  };

  const closePreview = () => {
    setShowPreview(false);
    setPdfUrl('');
    setSelectedReceiptId(null);
  };

  // Get selected customer name for display
  const getSelectedCustomerName = () => {
    const customer = customers.find(c => c.id == formData.customerId);
    return customer ? customer.name : 'No customer selected';
  };

  // --- START: New helper variables for validation ---
  const selectedProductObject = products.find(p => p.id == selectedProductId);
  const availableStock = selectedProductObject ? selectedProductObject.quantite : 0;
  const quantityInCart = formData.items.find(item => item.id == selectedProductId)?.quantite || 0;
  const maxQuantityToAdd = availableStock - quantityInCart;
  // --- END: New helper variables ---

  if (loading) return (
    <div className="receipt-loading-container">
      <Spinner animation="border" variant="primary" />
      <p>Chargement des reçus...</p>
    </div>
  );

  if (error) return (
    <div className="receipt-error-container">
      <Alert variant="danger">{error}</Alert>
      <Button className="receipt-action-btn" onClick={loadReceipts}>
        Réessayer
      </Button>
    </div>
  );

  const filteredReceipts = receipts.filter(order => {
    const query = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(query) ||
      (order.customerName && order.customerName.toLowerCase().includes(query)) ||
      (order.orderDate && new Date(order.orderDate).toLocaleDateString().toLowerCase().includes(query)) ||
      (order.totalPrice && order.totalPrice.toString().includes(query))
    );
  });

  return (
    <div className="receipt-page-container">
      {/* Header */}
      <Button
      variant='outline-primary'
      size='sm'
      onClick={() => navigate('/dashboard')}
      className="d-flex align-items-center gap-1">
        <i className="fas fa-home"></i> Back to Dashboard
        </Button>
      <div className="receipt-page-header">
        <h1 className="receipt-page-title">🧾 Reçus de Vente</h1>
        <p className="receipt-page-subtitle">Gérez vos commandes et reçus</p>
      </div>

      {/* Add Receipt Button */}
      <Button 
        className="receipt-action-btn receipt-action-btn-primary"
        onClick={() => setShowModal(true)}
      >
        Nouvelle Commande
      </Button>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <input
          type="text"
          placeholder="🔍 Rechercher un reçu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
          style={{ maxWidth: '300px' }}
        />
      </div>

      {/* Receipts Table */}
      <div className="receipt-table-container mt-4">
        <Table hover className="receipt-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th>Articles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center receipt-empty-state">
                  <div className="receipt-empty-state-icon">🧾</div>
                  <div className="receipt-empty-state-text">Aucun reçu trouvé</div>
                  <div className="receipt-empty-state-subtext">Créez votre première commande</div>
                </td>
              </tr>
            ) : (
              filteredReceipts.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    <span className="receipt-price">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </td>
                  <td>{order.items?.length || 0} article(s)</td>
                  <td>
                    <Button 
                      className="table-action-btn table-action-btn-success"
                      onClick={() => handlePreviewPdf(order.id)}
                    >
                      Aperçu
                    </Button>
                    <Button 
                      className="table-action-btn table-action-btn-primary"
                      onClick={() => handleDownloadPdf(order.id)}
                    >
                      Télécharger
                    </Button>
                      {/* --- NEW DELETE BUTTON --- */}
            <Button 
              className="table-action-btn table-action-btn-danger"
              onClick={() => handleDeleteSale(order.id)}
            >
              Supprimer
            </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Create Order Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="receipt-modal">
        <Modal.Header closeButton>
          <Modal.Title>Créer une Commande</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="receipt-form">
            {/* Customer Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Sélectionner un Client</Form.Label>
              <Form.Select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                required
              >
                <option value="">Choisir un client...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </Form.Select>
              {formData.customerId && (
                <Form.Text className="text-muted">
                  Client sélectionné: {getSelectedCustomerName()}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                required
              />
            </Form.Group>

            {/* Product Selection */}
            <div className="border p-3 rounded mb-3">
              <h6>Ajouter des Articles</h6>
              <div className="row g-2">
                <div className="col-md-6">
                  <Form.Label>Produit</Form.Label>
                  <Form.Select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setSelectedQuantity(1); // Reset quantity when product changes
                    }}
                  >
                    <option value="">Choisir un produit...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.nom} - {formatPrice(product.prixtva)}
                      </option>
                    ))}
                  </Form.Select>
                  {/* New: Display stock info */}
                  {selectedProductObject && (
                    <Form.Text className={`text-${maxQuantityToAdd > 0 ? 'success' : 'danger'}`}>
                      Stock disponible: {availableStock} (Déjà dans le panier: {quantityInCart})
                    </Form.Text>
                  )}
                </div>
                <div className="col-md-3">
                  <Form.Label>Quantité</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    // New: Limit max input to available remaining stock
                    max={maxQuantityToAdd > 0 ? maxQuantityToAdd : 1}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                    disabled={!selectedProductId}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <Button 
                    variant="outline-primary" 
                    onClick={handleAddItem} 
                    className="w-100"
                    // New: Disable button if no product is selected or quantity is invalid
                    disabled={!selectedProductId || maxQuantityToAdd <= 0 || selectedQuantity > maxQuantityToAdd}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>

            {/* Selected Items */}
            <h6>Articles Sélectionnés:</h6>
            {formData.items.length === 0 ? (
              <p className="text-primary">Aucun article ajouté.</p>
            ) : (
              <Table striped size="sm" className="receipt-items-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prix Unitaire</th>
                    <th>Quantité</th>
                    <th>Sous-total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.nom}</td>
                      <td>{formatPrice(item.prixtva)}</td>
                      <td>{item.quantite}</td>
                      <td>{formatPrice(parseFloat(item.prixtva) * item.quantite)}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            <hr />
            <h5>Total: {formatPrice(formData.totalPrice)}</h5>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            className="receipt-action-btn"
            onClick={() => {
              setShowModal(false);
              setFormData({
                customerId: '',
                totalPrice: 0,
                orderDate: new Date().toISOString().split('T')[0],
                items: []
              });
              setSelectedProductId('');
              setSelectedQuantity(1);
            }}
          >
            Annuler
          </Button>
          <Button 
            className="receipt-action-btn receipt-action-btn-primary"
            onClick={handleCreate}
            disabled={!formData.customerId || formData.items.length === 0}
          >
            Créer la Commande
          </Button>
        </Modal.Footer>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal show={showPreview} onHide={closePreview} size="lg" centered className="receipt-preview-modal">
        <Modal.Header closeButton>
          <Modal.Title>Aperçu du Reçu #{selectedReceiptId}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          <div className="pdf-preview-container">
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                width="100%"
                height="500"
                frameBorder="0"
                title="Aperçu du Reçu"
                className="pdf-iframe"
              />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            className="receipt-action-btn"
            onClick={closePreview}
          >
            Fermer
          </Button>
          <Button
            className="receipt-action-btn receipt-action-btn-primary"
            onClick={() => handleDownloadPdf(selectedReceiptId)}
          >
            Imprimer & Télécharger
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReceiptPage;