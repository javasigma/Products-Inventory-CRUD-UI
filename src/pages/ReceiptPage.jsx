import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner, InputGroup, FormControl, Badge } from 'react-bootstrap';
import { 
  FileText, DollarSign, Users, ArrowLeft, Search, Plus, Trash2, Eye, Download
} from 'lucide-react';
import { fetchReceipts, createReceipt, fetchProducts, downloadReceiptPdf, fetchCustomers, deleteSale } from '../api/api';
import './ReceiptPage.css';
import { useNavigate } from 'react-router-dom';

const DOCUMENT_TYPES = [
  { value: 'BON_COMMANDE', label: 'Bon de Commande', color: 'primary' },
  { value: 'BON_LIVRAISON', label: 'Bon de Livraison', color: 'info' },
  { value: 'BON_AVOIR', label: "Bon d'Avoir", color: 'danger' },
  { value: 'DEVIS', label: 'Devis', color: 'warning' },
  { value: 'FACTURE', label: 'Facture', color: 'success' },
  { value: 'RECU_AVANCE', label: 'Reçu / Acompte', color: 'secondary' },
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

  const [documentType, setDocumentType] = useState('BON_COMMANDE');

  const [formData, setFormData] = useState({
    customerId: '',
    totalPrice: 0,
    orderDate: new Date().toISOString().split('T')[0],
    items: []
  });
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [recuAmount, setRecuAmount] = useState('');

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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteSale(saleId); 
        loadReceipts();
        alert("Document supprimé avec succès.");
      } catch (err) {
        alert(`Erreur lors de la suppression: ${err.message}`);
      }
    }
  };

  const isRecu = documentType === 'RECU_AVANCE';
  const isAvoir = documentType === 'BON_AVOIR';

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const selectedProduct = products.find(p => p.id == selectedProductId);
    if (!selectedProduct) return;
    
    const existingItem = formData.items.find(item => item.id == selectedProductId);
    const quantityInCart = existingItem ? existingItem.quantite : 0;
    const totalRequestedQuantity = quantityInCart + selectedQuantity;

    if (!isAvoir && totalRequestedQuantity > selectedProduct.quantite) {
      const remainingStock = selectedProduct.quantite - quantityInCart;
      alert(`Quantité demandée (${totalRequestedQuantity}) dépasse le stock disponible pour ${selectedProduct.nom}. Stock restant: ${remainingStock}.`);
      return;
    }

    const existingItemIndex = formData.items.findIndex(item => item.id == selectedProductId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantite += selectedQuantity;
      setFormData(prev => ({
        ...prev,
        items: updatedItems,
        totalPrice: prev.totalPrice + (parseFloat(selectedProduct.prixtva) * selectedQuantity || 0)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          id: selectedProduct.id,
          nom: selectedProduct.nom,
          prixtva: selectedProduct.prixtva,
          quantite: selectedQuantity
        }],
        totalPrice: prev.totalPrice + (parseFloat(selectedProduct.prixtva) * selectedQuantity || 0)
      }));
    }
    
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const removedItem = formData.items[index];
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalPrice: prev.totalPrice - (parseFloat(removedItem.prixtva) * removedItem.quantite)
    }));
  };

  const handleCreate = async () => {
    const selectedCustomer = customers.find(c => c.id == formData.customerId);
    if (!selectedCustomer) {
      setError("Veuillez sélectionner un client.");
      return;
    }

    if (isRecu) {
      const amount = parseFloat(recuAmount);
      if (!recuAmount || isNaN(amount) || amount <= 0) {
        setError("Veuillez saisir un montant valide pour l'acompte.");
        return;
      }
      try {
        await createReceipt({
          customerName: selectedCustomer.name,
          orderDate: formData.orderDate + 'T00:00:00',
          totalPrice: amount,
          documentType: 'RECU_AVANCE',
          items: []
        });
        resetForm();
        setShowModal(false);
        loadReceipts();
      } catch (err) {
        setError(err.message);
      }
      return;
    }

    if (formData.items.length === 0) {
      setError("Veuillez ajouter au moins un article.");
      return;
    }

    try {
      await createReceipt({
        customerName: selectedCustomer.name,
        orderDate: formData.orderDate + 'T00:00:00',
        totalPrice: formData.totalPrice,
        documentType: documentType,
        items: formData.items
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
      customerId: '',
      totalPrice: 0,
      orderDate: new Date().toISOString().split('T')[0],
      items: []
    });
    setSelectedProductId('');
    setSelectedQuantity(1);
    setRecuAmount('');
    setDocumentType('BON_COMMANDE');
    setError(null);
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
      alert('Erreur lors de la génération du document: ' + err.message);
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      const response = await downloadReceiptPdf(id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_${id}.pdf`;
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
  const maxQuantityToAdd = isAvoir ? 9999 : (availableStock - quantityInCart);

  const totalRevenue = receipts.reduce((sum, r) => sum + (parseFloat(r.totalPrice) || 0), 0);
  const uniqueCustomers = new Set(receipts.map(r => r.customerName)).size;

  const getDocTypeLabel = (type) => {
    const found = DOCUMENT_TYPES.find(t => t.value === type);
    return found ? found.label : type || 'Inconnu';
  };

  const getDocTypeBadge = (type) => {
    const found = DOCUMENT_TYPES.find(t => t.value === type);
    const variant = found ? found.color : 'secondary';
    return <Badge bg={variant}>{getDocTypeLabel(type)}</Badge>;
  };

  if (loading) return (
    <div className="rcpt-loading">
      <Spinner animation="border" variant="primary" />
      <p>Chargement des documents...</p>
    </div>
  );

  if (error && !showModal) return (
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

  return (
    <div className="rcpt-page">
      <header className="rcpt-header">
        <Button variant="outline-light" size="sm" onClick={() => navigate('/dashboard')} className="rcpt-back-btn">
          <ArrowLeft size={16} /> Retour
        </Button>
        <div className="rcpt-header-content">
          <h1><FileText size={28} /> Documents Commerciaux</h1>
          <p>Gérez vos commandes, livraisons, factures et reçus</p>
        </div>
      </header>

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

      <div className="rcpt-toolbar">
        <InputGroup className="rcpt-search">
          <InputGroup.Text><Search size={16} /></InputGroup.Text>
          <FormControl
            placeholder="Rechercher par client, type, date, montant..."
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
                  <td>{getDocTypeBadge(order.documentType)}</td>
                  <td className="rcpt-client">{order.customerName}</td>
                  <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('fr-FR') : '-'}</td>
                  <td><span className="rcpt-price">{formatPrice(order.totalPrice)}</span></td>
                  <td>{order.items?.length || 0} article(s)</td>
                  <td>
                    <Button size="sm" variant="outline-success" className="rcpt-action-btn" onClick={() => handlePreviewPdf(order.id)}>
                      <Eye size={14} />
                    </Button>
                    <Button size="sm" variant="outline-primary" className="rcpt-action-btn" onClick={() => handleDownloadPdf(order.id)}>
                      <Download size={14} />
                    </Button>
                    <Button size="sm" variant="outline-danger" className="rcpt-action-btn" onClick={() => handleDeleteSale(order.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg" centered className="rcpt-modal">
        <Modal.Header closeButton>
          <Modal.Title>Nouveau {getDocTypeLabel(documentType)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && showModal && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Type de document *</Form.Label>
              <Form.Select
                value={documentType}
                onChange={(e) => {
                  setDocumentType(e.target.value);
                  setError(null);
                }}
              >
                {DOCUMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Form.Select>
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
                    {customer.name} — {customer.phone || 'Pas de téléphone'}
                  </option>
                ))}
              </Form.Select>
              {formData.customerId && (
                <Form.Text className="text-muted">
                  Client: {getSelectedCustomerName()}
                </Form.Text>
              )}
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

            {isRecu ? (
              <Form.Group className="mb-3">
                <Form.Label>Montant de l&apos;acompte (DH) *</Form.Label>
                <Form.Control
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={recuAmount}
                  onChange={(e) => setRecuAmount(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Aucun article n&apos;est requis pour un reçu d&apos;acompte.
                </Form.Text>
              </Form.Group>
            ) : (
              <>
                <div className="rcpt-items-section">
                  <h6>{isAvoir ? 'Articles retournés' : 'Ajouter des Articles'}</h6>
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
                        <Form.Text className={isAvoir ? 'text-info' : (maxQuantityToAdd > 0 ? 'text-success' : 'text-danger')}>
                          {isAvoir 
                            ? `Stock actuel: ${availableStock} (le retour augmentera le stock)` 
                            : `Stock: ${availableStock} (Panier: ${quantityInCart})`
                          }
                        </Form.Text>
                      )}
                    </div>
                    <div className="col-md-3">
                      <Form.Label>Quantité</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={isAvoir ? 99999 : (maxQuantityToAdd > 0 ? maxQuantityToAdd : 1)}
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
                        disabled={!selectedProductId || (!isAvoir && maxQuantityToAdd <= 0) || selectedQuantity < 1}
                      >
                        <Plus size={16} /> Ajouter
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rcpt-cart">
                  <h6>{isAvoir ? 'Articles retournés' : 'Articles sélectionnés'}</h6>
                  {formData.items.length === 0 ? (
                    <p className="text-muted">Aucun article {isAvoir ? 'retourné' : 'ajouté'}</p>
                  ) : (
                    <Table striped size="sm" className="rcpt-cart-table">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Prix U.</th>
                          <th>Qté</th>
                          <th>{isAvoir ? 'Crédit' : 'Sous-total'}</th>
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

                <div className="rcpt-total">
                  <h5>Total: <span>{formatPrice(formData.totalPrice)}</span></h5>
                </div>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
            Annuler
          </Button>
          <Button 
            className="rcpt-btn-primary" 
            onClick={handleCreate}
            disabled={!formData.customerId || (isRecu ? (!recuAmount || parseFloat(recuAmount) <= 0) : formData.items.length === 0)}
          >
            Créer le {getDocTypeLabel(documentType)}
          </Button>
        </Modal.Footer>
      </Modal>

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
            <Download size={16} /> Télécharger PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReceiptPage;