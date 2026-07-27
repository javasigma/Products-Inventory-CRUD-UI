// src/pages/VendorPage.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner, InputGroup, FormControl, Badge } from 'react-bootstrap';
import { 
  Building2, ArrowLeft, Search, Plus, Download, Edit2, Trash2, 
  Clock, DollarSign, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { fetchVendors, createVendor, updateVendor, deleteVendor } from '../api/api';
import './VendorPage.css';
import { useNavigate } from 'react-router-dom';

/* ---------- CSV export helper ---------- */
const downloadCSV = (filename, rows) => {
  const headers = ['ID', 'Name', 'Contact Person', 'Phone', 'Status', 'Lead Time (days)', 'Min. Order Value', 'Notes'];
  const csv = [
    headers.join(','),
    ...rows.map(r => [
      r.id,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      r.status,
      r.leadTimeDays ?? '',
      r.minimumOrderValue ?? '',
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

const VendorPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    status: 'ACTIVE',
    leadTimeDays: '',
    minimumOrderValue: '',
    notes: ''
  });

  useEffect(() => { loadVendors(); }, []);

  const loadVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      editingVendor
        ? await updateVendor(editingVendor.id, formData)
        : await createVendor(formData);
      resetForm();
      loadVendors();
    } catch (err) { setError(err.message); }
  };

  const handleEdit = vendor => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || '',
      contactPerson: vendor.contactPerson || '',
      phone: vendor.phone || '',
      status: vendor.status || 'ACTIVE',
      leadTimeDays: vendor.leadTimeDays || '',
      minimumOrderValue: vendor.minimumOrderValue || '',
      notes: vendor.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return;
    try {
      await deleteVendor(id);
      loadVendors();
    } catch (err) { setError(err.message); }
  };

  const resetForm = () => {
    setFormData({
      name: '', contactPerson: '', phone: '', status: 'ACTIVE',
      leadTimeDays: '', minimumOrderValue: '', notes: ''
    });
    setEditingVendor(null);
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <Badge bg="success" className="vnd-badge"><CheckCircle size={12} /> Actif</Badge>;
      case 'SUSPENDED': return <Badge bg="warning" text="dark" className="vnd-badge"><AlertTriangle size={12} /> Suspendu</Badge>;
      case 'ARCHIVED': return <Badge bg="secondary" className="vnd-badge"><XCircle size={12} /> Archivé</Badge>;
      default: return <Badge bg="secondary" className="vnd-badge">{status}</Badge>;
    }
  };

  /* ---------- filter ---------- */
  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---------- stats ---------- */
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length;
  const avgLeadTime = vendors.length > 0
    ? Math.round(vendors.reduce((sum, v) => sum + (parseInt(v.leadTimeDays) || 0), 0) / vendors.length)
    : 0;

  /* ---------- render ---------- */
  if (loading) return (
    <div className="vnd-loading">
      <Spinner animation="border" variant="primary" />
      <p>Chargement des fournisseurs...</p>
    </div>
  );

  if (error) return (
    <div className="vnd-error">
      <Alert variant="danger">{error}</Alert>
      <Button variant="primary" onClick={loadVendors}>Réessayer</Button>
    </div>
  );

  return (
    <div className="vnd-page">
      {/* Header */}
      <header className="vnd-header">
        <Button variant="outline-light" size="sm" onClick={() => navigate('/dashboard')} className="vnd-back-btn">
          <ArrowLeft size={16} /> Retour
        </Button>
        <div className="vnd-header-content">
          <h1><Building2 size={28} /> Fournisseurs</h1>
          <p>Gérez vos relations fournisseurs et leurs délais</p>
        </div>
      </header>

      {/* Stats */}
      <div className="vnd-stats">
        <div className="vnd-stat-card">
          <Building2 size={20} />
          <div>
            <span className="vnd-stat-value">{totalVendors}</span>
            <span className="vnd-stat-label">Fournisseurs</span>
          </div>
        </div>
        <div className="vnd-stat-card success">
          <CheckCircle size={20} />
          <div>
            <span className="vnd-stat-value">{activeVendors}</span>
            <span className="vnd-stat-label">Actifs</span>
          </div>
        </div>
        <div className="vnd-stat-card warning">
          <Clock size={20} />
          <div>
            <span className="vnd-stat-value">{avgLeadTime}j</span>
            <span className="vnd-stat-label">Délai moyen</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="vnd-toolbar">
        <InputGroup className="vnd-search">
          <InputGroup.Text><Search size={16} /></InputGroup.Text>
          <FormControl
            placeholder="Rechercher par nom, contact, téléphone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <div className="vnd-actions">
          <Button className="vnd-btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={18} /> Nouveau Fournisseur
          </Button>
          <Button variant="outline-secondary" onClick={() => downloadCSV('fournisseurs.csv', filteredVendors)}>
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="vnd-table-wrap">
        <Table className="vnd-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Contact</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Délai</th>
              <th>Commande min.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan="7" className="vnd-empty">
                  <Building2 size={48} />
                  <p>Aucun fournisseur trouvé</p>
                  <small>Ajoutez votre premier fournisseur</small>
                </td>
              </tr>
            ) : (
              filteredVendors.map(v => (
                <tr key={v.id}>
                  <td className="vnd-name">{v.name}</td>
                  <td>{v.contactPerson || '—'}</td>
                  <td>{v.phone || '—'}</td>
                  <td>{getStatusBadge(v.status)}</td>
                  <td className="vnd-lead">{v.leadTimeDays ? `${v.leadTimeDays} jours` : '—'}</td>
                  <td className="vnd-min">{v.minimumOrderValue ? `${Number(v.minimumOrderValue).toFixed(2)} DH` : '—'}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="vnd-action-btn" onClick={() => handleEdit(v)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="sm" variant="outline-danger" className="vnd-action-btn" onClick={() => handleDelete(v.id)}>
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
      <Modal show={showModal} onHide={resetForm} centered className="vnd-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingVendor ? <><Edit2 size={18} /> Modifier</> : <><Plus size={18} /> Nouveau Fournisseur</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom du fournisseur *</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Fournisseur ABC"
                required
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Contact</Form.Label>
                  <Form.Control
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Ex: Jean Dupont"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ex: +212 6XX XXX XXX"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="ACTIVE">Actif</option>
                    <option value="SUSPENDED">Suspendu</option>
                    <option value="ARCHIVED">Archivé</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Délai (jours)</Form.Label>
                  <Form.Control
                    name="leadTimeDays"
                    type="number"
                    value={formData.leadTimeDays}
                    onChange={handleInputChange}
                    placeholder="7"
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Commande min. (DH)</Form.Label>
                  <Form.Control
                    name="minimumOrderValue"
                    type="number"
                    step="0.01"
                    value={formData.minimumOrderValue}
                    onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="Informations complémentaires..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={resetForm}>Annuler</Button>
          <Button 
            className="vnd-btn-primary" 
            onClick={handleSave}
            disabled={!formData.name}
          >
            {editingVendor ? 'Mettre à jour' : 'Créer le fournisseur'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VendorPage;