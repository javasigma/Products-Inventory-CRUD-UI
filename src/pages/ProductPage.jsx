// src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Alert, Spinner, InputGroup, FormControl, Badge
} from 'react-bootstrap';
import { 
  Plus, Search, Download, Edit2, Trash2, ArrowLeft, 
  Package, Tag, Hash, Box, DollarSign, Layers
} from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './ProductPage.css';

/* ---------- CSV export helper ---------- */
const downloadCSV = (filename, rows) => {
  const headers = ['Référence', 'Nom', 'Désignation', 'Marque', 'Fournisseur', 'Quantité', 'Prix (TVA)'];
  const csv = [
    headers.join(','),
    ...rows.map(r => [
      r.reference || 'N/A',
      `"${(r.nom || '').replace(/"/g, '""')}"`,
      `"${(r.designation || '').replace(/"/g, '""')}"`,
      `"${(r.marque || '').replace(/"/g, '""')}"`,
      `"${(r.fournisseur || '').replace(/"/g, '""')}"`,
      r.quantite ?? '',
      r.prixtva ?? ''
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('reference');
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    designation: '',
    marque: '',
    fournisseur: '',
    quantite: '',
    prixtva: ''
  });

  const formatPrice = price =>
    price == null || price === '' || isNaN(Number(price))
      ? '—'
      : `${Number(price).toFixed(2)} DH`;

  const getStockBadge = (qty) => {
    const num = parseInt(qty) || 0;
    if (num <= 0) return <Badge bg="danger" className="stock-badge">Rupture</Badge>;
    if (num <= 5) return <Badge bg="warning" text="dark" className="stock-badge">Critique</Badge>;
    if (num <= 20) return <Badge bg="info" className="stock-badge">Faible</Badge>;
    return <Badge bg="success" className="stock-badge">OK</Badge>;
  };

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Échec du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createProduct({ ...formData, prixtva: parseFloat(formData.prixtva) || 0 });
      resetForm();
      loadProducts();
    } catch (err) { setError(err.message); }
  };

  const handleUpdate = async () => {
    try {
      await updateProduct(editingProduct.id, { ...formData, prixtva: parseFloat(formData.prixtva) || 0 });
      resetForm();
      loadProducts();
    } catch (err) { setError(err.message); }
  };

  const handleEdit = product => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom || '',
      designation: product.designation || '',
      marque: product.marque || '',
      fournisseur: product.fournisseur || '',
      quantite: product.quantite || '',
      prixtva: product.prixtva || ''
    });
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) { setError(err.message); }
  };

  const resetForm = () => {
    setFormData({
      nom: '', designation: '', marque: '',
      fournisseur: '', quantite: '', prixtva: ''
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  /* ---------- inline sort indicator - NO separate component ---------- */
  const getSortIndicator = (field) => {
    if (sortField !== field) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon">{sortAsc ? '↑' : '↓'}</span>;
  };

  /* ---------- filter & sort ---------- */
  const filteredProducts = products
    .filter(p => {
      const q = searchQuery.toLowerCase();
      return (
        (p.reference?.toLowerCase().includes(q)) ||
        (p.nom?.toLowerCase().includes(q)) ||
        (p.designation?.toLowerCase().includes(q)) ||
        (p.marque?.toLowerCase().includes(q)) ||
        (p.fournisseur?.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let va = a[sortField] || '';
      let vb = b[sortField] || '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (sortField === 'quantite' || sortField === 'prixtva') {
        va = parseFloat(va) || 0;
        vb = parseFloat(vb) || 0;
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

  /* ---------- stats ---------- */
  const totalProducts = products.length;
  const lowStock = products.filter(p => parseInt(p.quantite) <= 5).length;
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.prixtva) * (parseInt(p.quantite) || 0)), 0);

  /* ---------- render ---------- */
  if (loading) return (
    <div className="inv-loading">
      <Spinner animation="border" variant="primary" />
      <p>Chargement de l&apos;inventaire...</p>
    </div>
  );

  if (error) return (
    <div className="inv-error">
      <Alert variant="danger">{error}</Alert>
      <Button variant="primary" onClick={loadProducts}>Réessayer</Button>
    </div>
  );

  return (
    <div className="inv-page">
      {/* Header */}
      <header className="inv-header">
        <Button variant="outline-light" size="sm" onClick={() => navigate('/dashboard')} className="inv-back-btn">
          <ArrowLeft size={16} /> Retour
        </Button>
        <div className="inv-header-content">
          <h1><Package size={28} /> Gestion des Produits</h1>
          <p>Inventaire complet • {totalProducts} articles • {lowStock} en stock critique</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="inv-stats">
        <div className="inv-stat-card">
          <Hash size={20} />
          <div>
            <span className="inv-stat-value">{totalProducts}</span>
            <span className="inv-stat-label">Produits</span>
          </div>
        </div>
        <div className="inv-stat-card warning">
          <Box size={20} />
          <div>
            <span className="inv-stat-value">{lowStock}</span>
            <span className="inv-stat-label">Stock critique</span>
          </div>
        </div>
        <div className="inv-stat-card success">
          <DollarSign size={20} />
          <div>
            <span className="inv-stat-value">{totalValue.toFixed(0)}</span>
            <span className="inv-stat-label">Valeur stock (DH)</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="inv-toolbar">
        <InputGroup className="inv-search">
          <InputGroup.Text><Search size={16} /></InputGroup.Text>
          <FormControl
            placeholder="Rechercher par référence, nom, désignation, marque..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <div className="inv-actions">
          <Button className="inv-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nouveau Produit
          </Button>
          <Button variant="outline-secondary" onClick={() => downloadCSV('inventaire.csv', filteredProducts)}>
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="inv-table-wrap">
        <Table className="inv-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('reference')}><Tag size={14} /> Référence {getSortIndicator('reference')}</th>
              <th onClick={() => handleSort('nom')}>Nom {getSortIndicator('nom')}</th>
              <th onClick={() => handleSort('designation')}>Désignation {getSortIndicator('designation')}</th>
              <th onClick={() => handleSort('marque')}>Marque {getSortIndicator('marque')}</th>
              <th onClick={() => handleSort('quantite')}>Qté {getSortIndicator('quantite')}</th>
              <th onClick={() => handleSort('prixtva')}>Prix TTC {getSortIndicator('prixtva')}</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="inv-empty">
                  <Package size={48} />
                  <p>Aucun produit trouvé</p>
                  <small>Commencez par ajouter votre premier produit</small>
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.id} className={parseInt(p.quantite) <= 5 ? 'inv-row-warning' : ''}>
                  <td>
                    <code className="inv-ref">{p.reference || '—'}</code>
                  </td>
                  <td className="inv-name">{p.nom}</td>
                  <td className="inv-desc">{p.designation || '—'}</td>
                  <td>{p.marque || '—'}</td>
                  <td className="inv-qty">{p.quantite}</td>
                  <td className="inv-price">{formatPrice(p.prixtva)}</td>
                  <td>{getStockBadge(p.quantite)}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="inv-action-btn" onClick={() => handleEdit(p)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="sm" variant="outline-danger" className="inv-action-btn" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="inv-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? <><Edit2 size={18} /> Modifier</> : <><Plus size={18} /> Nouveau Produit</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label><Tag size={14} /> Nom de l&apos;article *</Form.Label>
              <Form.Control
                value={formData.nom}
                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Robinet"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><Layers size={14} /> Désignation *</Form.Label>
              <Form.Control
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Ex: ROCA PETIT 90°"
                required
              />
              <Form.Text className="text-muted">Utilisée pour générer la référence automatique (RP0001)</Form.Text>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Marque</Form.Label>
                  <Form.Control
                    value={formData.marque}
                    onChange={e => setFormData({ ...formData, marque: e.target.value })}
                    placeholder="Ex: ROCA"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fournisseur</Form.Label>
                  <Form.Control
                    value={formData.fournisseur}
                    onChange={e => setFormData({ ...formData, fournisseur: e.target.value })}
                    placeholder="Ex: Fournisseur ABC"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label><Box size={14} /> Quantité *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.quantite}
                    onChange={e => setFormData({ ...formData, quantite: e.target.value })}
                    placeholder="0"
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label><DollarSign size={14} /> Prix TTC (DH) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.prixtva}
                    onChange={e => setFormData({ ...formData, prixtva: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button 
            className="inv-btn-primary" 
            onClick={editingProduct ? handleUpdate : handleCreate}
            disabled={!formData.nom || !formData.designation}
          >
            {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductPage;