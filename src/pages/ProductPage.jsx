// src/pages/ProductPage.js
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Alert, Spinner, InputGroup, FormControl
} from 'react-bootstrap';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api/api';
import './ProductPage.css';
import { useNavigate } from 'react-router-dom';

/* ----------  CSV export helper  ---------- */
const downloadCSV = (filename, rows) => {
  const headers = ['ID', 'Nom', 'Désignation', 'Marque', 'Fournisseur', 'Quantité', 'Prix (TVA)'];
  const csv = [
    headers.join(','),
    ...rows.map(r =>
      [
        r.id,
        `"${(r.nom || '').replace(/"/g, '""')}"`,
        `"${(r.designation || '').replace(/"/g, '""')}"`,
        `"${(r.marque || '').replace(/"/g, '""')}"`,
        `"${(r.fournisseur || '').replace(/"/g, '""')}"`,
        r.quantite ?? '',
        r.prixtva ?? ''
      ].join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
  const navigate = useNavigate();        // 🔍

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
      : `$${Number(price).toFixed(2)}`;

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
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

  /* ----------  filter  ---------- */
  const filteredProducts = products.filter(p =>
    p.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.marque?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.fournisseur?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ----------  states  ---------- */
  if (loading) return (
    <div className="product-loading-container">
      <Spinner animation="border" variant="primary"/>
      <p>Chargement des produits...</p>
    </div>
  );

  if (error) return (
    <div className="product-error-container">
      <Alert variant="danger">{error}</Alert>
      <Button className="product-action-btn" onClick={loadProducts}>Réessayer</Button>
    </div>
  );

  return (
    <div className="product-page-container">
      <div className="product-page-header">
         <Button
              variant='outline-primary'
              size='sm'
              onClick={() => navigate('/dashboard')}
              className="d-flex align-items-center gap-1">
                <i className="fas fa-home"></i> Back to Dashboard
                </Button>
        <h1 className="product-page-title">📦 Produits</h1>
        <p className="product-page-subtitle">Gérez votre inventaire de produits</p>
      </div>

      {/*  TOOLBAR  */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <InputGroup className="search-bar w-50">
          <FormControl
            placeholder="Rechercher un produit (nom, désignation, marque, fournisseur)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <div className="d-flex gap-2">
          <Button
            className="product-action-btn product-action-btn-primary"
            onClick={() => setShowModal(true)}
          >
            Ajouter un Produit
          </Button>

          <Button
            className="product-action-btn product-action-btn-secondary"
            variant="outline-success"
            onClick={() => downloadCSV('produits.csv', filteredProducts)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/*  TABLE  */}
      <div className="product-table-container">
        <Table hover className="product-table">
          <thead>
            <tr>
              <th>ID</th><th>Nom</th><th>Désignation</th>
              <th>Marque</th><th>Fournisseur</th><th>Quantité</th>
              <th>Prix (TVA)</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center product-empty-state">
                  <div className="product-empty-state-icon">📦</div>
                  <div className="product-empty-state-text">Aucun produit trouvé</div>
                  <div className="product-empty-state-subtext">Commencez par ajouter votre premier produit</div>
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nom}</td>
                  <td>{p.designation}</td>
                  <td>{p.marque}</td>
                  <td>{p.fournisseur}</td>
                  <td>{p.quantite}</td>
                  <td><span className="product-price">{formatPrice(p.prixtva)}</span></td>
                  <td>
                    <Button
                      className="table-action-btn table-action-btn-warning me-2"
                      onClick={() => handleEdit(p)}
                    >
                      Modifier
                    </Button>
                    <Button
                      className="table-action-btn table-action-btn-danger"
                      onClick={() => handleDelete(p.id)}
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

      {/*  MODAL  */}
      <Modal show={showModal} onHide={() => setShowModal(false)} className="product-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="product-form">
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                value={formData.nom}
                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Laptop Dell"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Désignation</Form.Label>
              <Form.Control
                type="text"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Ex: Gaming Laptop 16GB"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Marque</Form.Label>
              <Form.Control
                type="text"
                value={formData.marque}
                onChange={e => setFormData({ ...formData, marque: e.target.value })}
                placeholder="Ex: Dell, HP"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fournisseur</Form.Label>
              <Form.Control
                type="text"
                value={formData.fournisseur}
                onChange={e => setFormData({ ...formData, fournisseur: e.target.value })}
                placeholder="Ex: ABC Tech"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control
                type="text"
                value={formData.quantite}
                onChange={e => setFormData({ ...formData, quantite: e.target.value })}
                placeholder="Ex: 12"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Prix (TVA)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.prixtva}
                onChange={e => setFormData({ ...formData, prixtva: e.target.value })}
                placeholder="0.00"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="product-action-btn" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button
            className="product-action-btn product-action-btn-primary"
            onClick={editingProduct ? handleUpdate : handleCreate}
          >
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductPage;