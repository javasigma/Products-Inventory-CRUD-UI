// src/pages/CustomerPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Alert, Spinner, InputGroup, FormControl, Badge
} from 'react-bootstrap';
import { 
  Users, ArrowLeft, Search, Plus, Download, Edit2, Trash2,
  UserCheck, UserX, AlertTriangle, DollarSign, MapPin
} from 'lucide-react';
import { fetchCustomers, createCustomer, deleteCustomer } from '../api/api';
import './CustomerPage.css';
import { useNavigate } from 'react-router-dom';

/* ---------- CSV export helper ---------- */
const downloadCSV = (filename, rows) => {
  const headers = ['ID', 'Nom', 'Téléphone', 'Adresse', 'Statut', 'Crédit Max (DH)', 'Solde Dû (DH)', 'Notes'];
  const csv = [
    headers.join(','),
    ...rows.map(r => [
      r.id,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`,
      r.status,
      r.creditLimit ?? '',
      r.outstandingBalance ?? '',
      `"${(r.notes || '').replace(/"/g, '""')}"`
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
      setError(err.message || 'Échec du chargement des clients');
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

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <Badge bg="success" className="cust-badge"><UserCheck size={12} /> Actif</Badge>;
      case 'BLOCKED': return <Badge bg="warning" text="dark" className="cust-badge"><AlertTriangle size={12} /> Bloqué</Badge>;
      case 'BLACK_LIST': return <Badge bg="danger" className="cust-badge"><UserX size={12} /> Blacklisté</Badge>;
      default: return <Badge bg="secondary" className="cust-badge">{status}</Badge>;
    }
  };

  /* ---------- filter ---------- */
  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------- stats ---------- */
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
  const totalDebt = customers.reduce((sum, c) => sum + (parseFloat(c.outstandingBalance) || 0), 0);
  const totalCredit = customers.reduce((sum, c) => sum + (parseFloat(c.creditLimit) || 0), 0);

  /* ---------- render ---------- */
  if (loading) return (
    <div className="cust-loading">
      <Spinner animation="border" variant="primary" />
      <p>Chargement des clients...</p>
    </div>
  );

  if (error) return (
    <div className="cust-error">
      <Alert variant="danger">{error}</Alert>
      <Button variant="primary" onClick={loadCustomers}>Réessayer</Button>
    </div>
  );

  return (
    <div className="cust-page">
      {/* Header */}
      <header className="cust-header">
        <Button variant="outline-light" size="sm" onClick={() => navigate('/dashboard')} className="cust-back-btn">
          <ArrowLeft size={16} /> Retour
        </Button>
        <div className="cust-header-content">
          <h1><Users size={28} /> Clients</h1>
          <p>Gérez votre base de clients et leurs crédits</p>
        </div>
      </header>

      {/* Stats */}
      <div className="cust-stats">
        <div className="cust-stat-card">
          <Users size={20} />
          <div>
            <span className="cust-stat-value">{totalCustomers}</span>
            <span className="cust-stat-label">Clients</span>
          </div>
        </div>
        <div className="cust-stat-card success">
          <UserCheck size={20} />
          <div>
            <span className="cust-stat-value">{activeCustomers}</span>
            <span className="cust-stat-label">Actifs</span>
          </div>
        </div>
        <div className="cust-stat-card warning">
          <DollarSign size={20} />
          <div>
            <span className="cust-stat-value">{totalDebt.toFixed(0)} DH</span>
            <span className="cust-stat-label">Total dû</span>
          </div>
        </div>
        <div className="cust-stat-card">
          <MapPin size={20} />
          <div>
            <span className="cust-stat-value">{totalCredit.toFixed(0)} DH</span>
            <span className="cust-stat-label">Crédit total</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="cust-toolbar">
        <InputGroup className="cust-search">
          <InputGroup.Text><Search size={16} /></InputGroup.Text>
          <FormControl
            placeholder="Rechercher par nom, téléphone, adresse..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <div className="cust-actions">
          <Button className="cust-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nouveau Client
          </Button>
          <Button variant="outline-secondary" onClick={() => downloadCSV('clients.csv', filteredCustomers)}>
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="cust-table-wrap">
        <Table className="cust-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th>Statut</th>
              <th>Crédit Max</th>
              <th>Solde Dû</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="cust-empty">
                  <Users size={48} />
                  <p>Aucun client trouvé</p>
                  <small>Ajoutez votre premier client</small>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td className="cust-name">{c.name}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.address || '—'}</td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td className="cust-credit">{parseFloat(c.creditLimit || 0).toFixed(2)} DH</td>
                  <td className="cust-debt">{parseFloat(c.outstandingBalance || 0).toFixed(2)} DH</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="cust-action-btn" onClick={() => handleEdit(c)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="sm" variant="outline-danger" className="cust-action-btn" onClick={() => handleDelete(c.id)}>
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
      <Modal show={showModal} onHide={resetForm} centered className="cust-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCustomer ? <><Edit2 size={18} /> Modifier</> : <><Plus size={18} /> Nouveau Client</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom du client *</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Jean Dupont"
                required
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: +212 6XX XXX XXX"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select 
                    name="status" 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="BLOCKED">Bloqué</option>
                    <option value="BLACK_LIST">Blacklisté</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                name="address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: 123 Rue de Paris, Casablanca"
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Crédit Max (DH)</Form.Label>
                  <Form.Control
                    name="creditLimit"
                    type="number"
                    step="0.01"
                    value={formData.creditLimit}
                    onChange={e => setFormData({ ...formData, creditLimit: e.target.value })}
                    placeholder="5000.00"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Solde Dû (DH)</Form.Label>
                  <Form.Control
                    name="outstandingBalance"
                    type="number"
                    step="0.01"
                    value={formData.outstandingBalance}
                    onChange={e => setFormData({ ...formData, outstandingBalance: e.target.value })}
                    placeholder="0.00"
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                name="notes"
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informations complémentaires..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={resetForm}>Annuler</Button>
          <Button 
            className="cust-btn-primary" 
            onClick={handleCreate}
            disabled={!formData.name}
          >
            {editingCustomer ? 'Mettre à jour' : 'Créer le client'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomerPage;