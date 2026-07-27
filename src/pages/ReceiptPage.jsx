// src/pages/ReceiptPage.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner, InputGroup, FormControl, Badge } from 'react-bootstrap';
import { 
  FileText, DollarSign, Users, ArrowLeft, Search, Plus,
  ShoppingCart, Truck, RotateCcw, FileCheck, Receipt, CreditCard
} from 'lucide-react';
import { fetchReceipts, createReceipt, fetchProducts, downloadReceiptPdf, fetchCustomers, deleteSale } from '../api/api';
import './ReceiptPage.css';
import { useNavigate } from 'react-router-dom';

// Document types configuration
const DOCUMENT_TYPES = [
  { 
    id: 'BON_COMMANDE', 
    label: 'Bon de Commande', 
    icon: ShoppingCart,
    color: '#3b82f6',
    requiresItems: true,
    description: 'Commande client'
  },
  { 
    id: 'BON_LIVRAISON', 
    label: 'Bon de Livraison', 
    icon: Truck,
    color: '#22c55e',
    requiresItems: true,
    description: 'Livraison marchandises'
  },
  { 
    id: 'BON_AVOIR', 
    label: 'Bon d\'Avoir', 
    icon: RotateCcw,
    color: '#f59e0b',
    requiresItems: true,
    description: 'Retour produit'
  },
  { 
    id: 'BON_DEVIS', 
    label: 'Bon Devis', 
    icon: FileCheck,
    color: '#8b5cf6',
    requiresItems: true,
    description: 'Proposition commerciale'
  },
  { 
    id: 'FACTURE', 
    label: 'Facture', 
    icon: FileText,
    color: '#ef4444',
    requiresItems: true,
    description: 'Facture complète'
  },
  { 
    id: 'RECU_AVANCE', 
    label: 'Reçu d\'Avance', 
    icon: CreditCard,
    color: '#06b6d4',
    requiresItems: false,
    description: 'Paiement avance'
  }
];

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

  const [formData, setFormData] = useState({
    documentType: 'BON_COMMANDE',
    customerId: '',
    totalPrice: 0,
    orderDate: new Date().toISOString().split('T')[0],
    items: [],
    advanceAmount: '',
    notes: ''
  });
  
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

  const handleDeleteSale = async (saleId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      try {
        await deleteSale(saleId); 
        loadReceipts();
        alert("Commande supprimée avec succès.");
      } catch (err) {
        alert(`Erreur lors de la suppression: ${err.message}`);
      }
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const selectedProduct = products.find(p => p.id == selectedProductId);
    if (!selectedProduct) return;
    
    const existingItem = formData.items.find(item => item.id == selectedProductId);
    const quantityInCart = existingItem ? existingItem.quantite : 0;
    const totalRequestedQuantity = quantityInCart + selectedQuantity;

    if (totalRequestedQuantity > selectedProduct.quantite) {
      const remainingStock = selectedProduct.quantite - quantityInCart;
      alert(`Quantité demandée (${totalRequestedQuantity}) dépasse le stock disponible pour ${selectedProduct.nom}. Stock restant: ${remainingStock}.`);
      return;
    }

    const existingItemIndex = formData.items.findIndex(item => item.id == selectedProductId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantite += selectedQuantity;
      setFormData({
        ...formData,
        items: updatedItems,
        totalPrice: formData.totalPrice + (parseFloat(selectedProduct.prixtva) * selectedQuantity || 0)
      });
    } else {
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
    if (!formData.customerId) {
      setError("Veuillez sélectionner un client.");
      return;
    }

    const selectedDocType = DOCUMENT_TYPES.find(d => d.id === formData.documentType);
    if (selectedDocType.requiresItems && formData.items.length === 0) {
      setError("Veuillez sélectionner au moins un article.");
      return;
    }

    try {
      const selectedCustomer = customers.find(c => c.id == formData.customerId);
      if (!selectedCustomer) {
        setError("Client invalide");
        return;
      }

      await createReceipt({
        documentType: formData.documentType,
        customerName: selectedCustomer.name,
        orderDate: formData.orderDate + 'T00:00:00',
        totalPrice: formData.totalPrice,
        items: formData.items,
        advanceAmount: formData.advanceAmount,
        notes: formData.notes
      });
      
      resetForm();
      setShowModal(false);
      loadReceipts();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      documentType: 'BON_COMMANDE',
      customerId: '',
      totalPrice: 0,
      orderDate: new Date().toISOString().split('T')[0],
      items: [],
      advanceAmount: '',
      notes: ''
    });
    setSelectedProductId('');
    setSelectedQuantity(1);
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
    return `${num.toFixed(2)} DH`;
  };

  const closePreview = () => {
    setShowPreview(false);
    setPdfUrl('');
    setSelectedReceiptId(null);
  };

  const getSelectedCustomerName = () => {
    const customer = customers.find(c => c.id == formData.customerId);
    return customer ? customer.name : 'Aucun client sélectionné';
  };

  const selectedProductObject = products.find(p => p.id == selectedProductId);
  const availableStock = selectedProductObject ? selectedProductObject.quantite : 0;
  const quantityInCart = formData.items.find(item => item.id == selectedProductId)?.quantite || 0;
  const maxQuantityToAdd = availableStock - quantityInCart;

  const totalRevenue = receipts.reduce((sum, r) => sum + (parseFloat(r.totalPrice) || 0), 0);
  const uniqueCustomers = new Set(receipts.map(r => r.customerName)).size;

  const getDocumentTypeBadge = (type) => {
    const docType = DOCUMENT_TYPES.find(d => d.id === type);
    if (!docType) return <Badge bg="secondary">{type}</Badge>;
    return <Badge style={{ backgroundColor: docType.color }}>{docType.label}</Badge>;
  };

  if (loading) return (
    <div className="rcpt-loading">
      <Spinner animation="border" variant="primary" />
      <p>Chargement des reçus...</p>
    </div>
  );

  if (error) return (
    <div className="rcpt-error">
      <Alert variant="danger">{error}</Alert>
      <Button variant="primary" onClick={loadReceipts}>Réessayer</Button>
    </div>
  );

  const filteredReceipts = receipts.filter(order => {
    const query = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(query) ||
      (order.customerName && order.customerName.toLowerCase().includes(query)) ||
      (order.documentType && order.documentType.toLowerCase().includes(query)) ||
      (order.orderDate && new Date(order.orderDate).toLocaleDateString().toLowerCase().includes(query)) ||
      (order.totalPrice && order.totalPrice.toString().includes(query))
    );
  });

  const currentDocType = DOCUMENT_TYPES.find(d => d.id === formData.documentType);
  const requiresItems = currentDocType?.requiresItems !== false;

  return (
    <div className="rcpt-page">
      {/* Header */}
      <header className="rcpt-header">
        <Button variant="outline-light" size="sm" onClick={() => navigate('/dashboard')} className="rcpt-back-btn">
          <ArrowLeft size={16} /> Retour
        </Button>
        <div className="rcpt-header-content">
          <h1><FileText size={28} /> Documents</h1>
          <p>Gérez vos bons de commande, livraison, avoir, devis, factures et reçus</p>
        </div>
      </header>

      {/* Stats */}
      <div className="rcpt-stats">
        <div className="rcpt-stat-card">
          <FileText size={20} />
          <div>
            <span className="rcpt-stat-value">{receipts.length}</span>
            <span className="rcpt-stat-label">Documents</span>
          </div>
        </div>
        <div className="rcpt-stat-card success">
          <DollarSign size={20} />
          <div>
            <span className="rcpt-stat-value">{totalRevenue.toFixed(0)}</span>
            <span className="rcpt-stat-label">Chiffre d&apos;affaires (DH)</span>
          </div>
        </div>
        <div className="rcpt-stat-card warning">
          <Users size={20} />
          <div>
            <span className="rcpt-stat-value">{uniqueCustomers}</span>
            <span className="rcpt-stat-label">Clients uniques</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rcpt-toolbar">
        <InputGroup className="rcpt-search">
          <InputGroup.Text><Search size={16} /></InputGroup.Text>
          <FormControl
            placeholder="Rechercher par document, client, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <div className="rcpt-actions">
          <Button className="rcpt-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nouveau Document
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rcpt-table-wrap">
        <Table className="rcpt-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Type</th>
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
                <td colSpan="7" className="rcpt-empty">
                  <FileText size={48} />
                  <p>Aucun document trouvé</p>
                  <small>Créez votre premier document</small>
                </td>
              </tr>
            ) : (
              filteredReceipts.map((order) => (
                <tr key={order.id}>
                  <td><code className="rcpt-id">#{order.id}</code></td>
                  <td>{getDocumentTypeBadge(order.documentType)}</td>
                  <td className="rcpt-client">{order.customerName}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString('fr-FR')}</td>
                  <td><span className="rcpt-price">{formatPrice(order.totalPrice)}</span></td>
                  <td>{order.items?.length || 0} article(s)</td>
                  <td>
                    <Button size="sm" variant="outline-success" className="rcpt-action-btn" onClick={() => handlePreviewPdf(order.id)}>
                      Aperçu
                    </Button>
                    <Button size="sm" variant="outline-primary" className="rcpt-action-btn" onClick={() => handleDownloadPdf(order.id)}>
                      Télécharger
                    </Button>
                    <Button size="sm" variant="outline-danger" className="rcpt-action-btn" onClick={() => handleDeleteSale(order.id)}>
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Create Document Modal */}
      <Modal show={showModal} onHide={resetForm} size="lg" centered className="rcpt-modal">
        <Modal.Header closeButton>
          <Modal.Title>Créer un Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Document Type Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Type de Document *</Form.Label>
              <div className="rcpt-doc-types">
                {DOCUMENT_TYPES.map(docType => {
                  const Icon = docType.icon;
                  const isSelected = formData.documentType === docType.id;
                  return (
                    <div
                      key={docType.id}
                      className={`rcpt-doc-type ${isSelected ? 'selected' : ''}`}
                      style={{ borderColor: isSelected ? docType.color : '#e2e8f0' }}
                      onClick={() => setFormData({ ...formData, documentType: docType.id })}
                    >
                      <Icon size={24} style={{ color: isSelected ? docType.color : '#94a3b8' }} />
                      <span className="rcpt-doc-type-label">{docType.label}</span>
                      <span className="rcpt-doc-type-desc">{docType.description}</span>
                    </div>
                  );
                })}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Client *</Form.Label>
              <Form.Select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                required
              >
                <option value="">Choisir un client...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} — {customer.phone}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                required
              />
            </Form.Group>

            {/* Items Section - Only if document requires items */}
            {requiresItems && (
              <>
                <div className="rcpt-items-section">
                  <h6>Ajouter des Articles</h6>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <Form.Label>Produit</Form.Label>
                      <Form.Select
                        value={selectedProductId}
                        onChange={(e) => {
                          setSelectedProductId(e.target.value);
                          setSelectedQuantity(1);
                        }}
                      >
                        <option value="">Choisir un produit...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.nom} — {formatPrice(product.prixtva)}
                          </option>
                        ))}
                      </Form.Select>
                      {selectedProductObject && (
                        <Form.Text className={maxQuantityToAdd > 0 ? 'text-success' : 'text-danger'}>
                          Stock: {availableStock} (Panier: {quantityInCart})
                        </Form.Text>
                      )}
                    </div>
                    <div className="col-md-3">
                      <Form.Label>Quantité</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
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
                        disabled={!selectedProductId || maxQuantityToAdd <= 0 || selectedQuantity > maxQuantityToAdd}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rcpt-cart">
                  <h6>Articles Sélectionnés</h6>
                  {formData.items.length === 0 ? (
                    <p className="text-muted">Aucun article ajouté</p>
                  ) : (
                    <Table striped size="sm" className="rcpt-cart-table">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Prix U.</th>
                          <th>Qté</th>
                          <th>Sous-total</th>
                          <th></th>
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
                              <Button variant="outline-danger" size="sm" onClick={() => handleRemoveItem(idx)}>
                                ×
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </>
            )}

            {/* Advance Amount - Only for RECU_AVANCE */}
            {formData.documentType === 'RECU_AVANCE' && (
              <Form.Group className="mb-3">
                <Form.Label>Montant de l'Avance (DH)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.advanceAmount}
                  onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
                  placeholder="0.00"
                />
                <Form.Text className="text-muted">
                  Montant payé par le client en avance
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informations complémentaires..."
              />
            </Form.Group>

            <div className="rcpt-total">
              <h5>Total: <span>{formatPrice(formData.totalPrice)}</span></h5>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={resetForm}>Annuler</Button>
          <Button 
            className="rcpt-btn-primary" 
            onClick={handleCreate}
            disabled={!formData.customerId || (requiresItems && formData.items.length === 0)}
          >
            Créer le Document
          </Button>
        </Modal.Footer>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal show={showPreview} onHide={closePreview} size="lg" centered className="rcpt-modal">
        <Modal.Header closeButton>
          <Modal.Title>Aperçu du Document #{selectedReceiptId}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="rcpt-preview-body">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="500"
              frameBorder="0"
              title="Aperçu du Document"
              className="rcpt-iframe"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closePreview}>Fermer</Button>
          <Button className="rcpt-btn-primary" onClick={() => handleDownloadPdf(selectedReceiptId)}>
            Télécharger PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReceiptPage;