// src/pages/CustomerPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Alert, Spinner, InputGroup, FormControl
} from 'react-bootstrap';
import { fetchCustomers, createCustomer, deleteCustomer } from '../api/api';
import './CustomerPage.css';
import { useNavigate } from 'react-router-dom';

/* ----------  CSV export helper  ---------- */
const downloadCSV = (filename, rows) => {
  const headers = ['ID', 'Name', 'Phone', 'Address', 'Status', 'Credit Limit', 'Outstanding Balance', 'Notes'];
  const csv = [
    headers.join(','),
    ...rows.map(r =>
      [
        r.id,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.address || '').replace(/"/g, '""')}"`,
        r.status,
        r.creditLimit ?? '',
        r.outstandingBalance ?? '',
        `"${(r.notes || '').replace(/"/g, '""')}"`
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

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
    creditLimit: '',
    outstandingBalance: '',
    notes: ''
  });

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createCustomer(formData);
      resetForm();
      loadCustomers();
    } catch (err) { setError(err.message); }
  };

  const handleEdit = customer => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      address: customer.address || '',
      status: customer.status || 'ACTIVE',
      creditLimit: customer.creditLimit || '',
      outstandingBalance: customer.outstandingBalance || '',
      notes: customer.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (err) { setError(err.message); }
  };

  const resetForm = () => {
    setFormData({
      name: '', phone: '', address: '', status: 'ACTIVE',
      creditLimit: '', outstandingBalance: '', notes: ''
    });
    setEditingCustomer(null);
    setShowModal(false);
  };

  /* ----------  search filter  ---------- */
  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ----------  loading / error  ---------- */
  if (loading) return (
    <div className="customer-loading-container">
      <Spinner animation="border" variant="primary"/>
      <p>Chargement des clients...</p>
    </div>
  );

  if (error) return (
    <div className="customer-error-container">
      <Alert variant="danger">{error}</Alert>
      <Button className="customer-action-btn" onClick={loadCustomers}>Réessayer</Button>
    </div>
  );

  return (
    <div className="customer-page-container">
      <div className="customer-page-header">
         <Button
              variant='outline-primary'
              size='sm'
              onClick={() => navigate('/dashboard')}
              className="d-flex align-items-center gap-1">
                <i className="fas fa-home"></i> Back to Dashboard
                </Button>
        <h1 className="customer-page-title">👥 Clients</h1>
        <p className="customer-page-subtitle">Gérez votre base de clients</p>
      </div>

      {/*  TOOLBAR  */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <InputGroup className="search-bar w-50">
          <FormControl
            placeholder="🔍 Rechercher un client par nom ou téléphone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <div className="d-flex gap-2">
          <Button
            className="customer-action-btn customer-action-btn-primary"
            onClick={() => setShowModal(true)}
          >
            Ajouter un Client
          </Button>

          <Button
            className="customer-action-btn customer-action-btn-secondary"
            variant="outline-success"
            onClick={() => downloadCSV('clients.csv', filteredCustomers)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/*  TABLE  */}
      <div className="customer-table-container">
        <Table hover className="customer-table">
          <thead>
            <tr>
              <th>ID</th><th>Nom</th><th>Téléphone</th>
              <th>Adresse</th><th>Status</th><th>Crédit Max (€)</th>
              <th>Solde Dû (€)</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center customer-empty-state">
                  <div className="customer-empty-state-icon">👥</div>
                  <div className="customer-empty-state-text">Aucun client trouvé</div>
                  <div className="customer-empty-state-subtext">
                    Essayez une autre recherche ou ajoutez un client
                  </div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.address}</td>
                  <td>
                    <span className={`badge ${
                      c.status === 'ACTIVE' ? 'bg-success' :
                      c.status === 'BLOCKED' ? 'bg-warning' :
                      c.status === 'BLACK_LIST' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {c.status === 'ACTIVE' ? 'Actif' :
                       c.status === 'BLOCKED' ? 'Bloqué' :
                       c.status === 'BLACK_LIST' ? 'Blacklisté' : c.status}
                    </span>
                  </td>
                  <td>{parseFloat(c.creditLimit || 0).toFixed(2)} €</td>
                  <td>{parseFloat(c.outstandingBalance || 0).toFixed(2)} €</td>
                  <td>
                    <Button
                      size="sm"
                      className="table-action-btn table-action-btn-warning me-2"
                      onClick={() => handleEdit(c)}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      className="table-action-btn table-action-btn-danger"
                      onClick={() => handleDelete(c.id)}
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
      <Modal show={showModal} onHide={resetForm} className="customer-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editingCustomer ? 'Modifier le Client' : 'Ajouter un Client'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="customer-form">
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Jean Dupont"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Rue de Paris"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Actif</option>
                <option value="BLOCKED">Bloqué</option>
                <option value="BLACK_LIST">Blacklisté</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Crédit Max (€)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.creditLimit}
                onChange={e => setFormData({ ...formData, creditLimit: e.target.value })}
                placeholder="5000.00"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Solde Dû (€)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.outstandingBalance}
                onChange={e => setFormData({ ...formData, outstandingBalance: e.target.value })}
                placeholder="1250.75"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informations supplémentaires..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="customer-action-btn" onClick={resetForm}>Annuler</Button>
          <Button
            className="customer-action-btn customer-action-btn-primary"
            onClick={handleCreate}
            disabled={!formData.name.trim()}
          >
            {editingCustomer ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomerPage;