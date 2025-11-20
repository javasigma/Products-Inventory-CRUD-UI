import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner, InputGroup, FormControl } from 'react-bootstrap';
import { fetchVendors, createVendor, updateVendor, deleteVendor } from '../api/api';
import './VendorPage.css';
import { useNavigate } from 'react-router-dom';

/* ----------  CSV export helper  ---------- */
const downloadCSV = (filename, rows) => {
  const headers = ['ID','Name','Contact Person','Phone','Status','Lead Time (days)','Min. Order Value','Notes'];
  const csvContent = [
    headers.join(','),
    ...rows.map(r =>
      [
        r.id,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.contactPerson || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        r.status,
        r.leadTimeDays ?? '',
        r.minimumOrderValue ?? '',
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ].join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
    setLoading(true); setError(null);
    try {
      const data = await fetchVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
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
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
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

  /* ----------  search & filter  ---------- */
  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ----------  loading / error states  ---------- */
  if (loading) return (
    <div className="vendor-page-container">
      <div className="vendor-loading-container text-center">
        <Spinner animation="border" variant="primary"/>
        <p>Loading vendors...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="vendor-page-container">
      <div className="vendor-error-container">
        <Alert variant="danger">{error}</Alert>
        <Button className="vendor-action-btn" onClick={loadVendors}>Retry</Button>
      </div>
    </div>
  );

  /* ----------  render  ---------- */
// ✅ Initialize navigate

  // ... (all your existing state and logic)

  return (
    <div className="vendor-page-container">
      {/* 🔼 NEW: Back to Dashboard Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="d-flex align-items-center gap-1"
        >
          <i className="fas fa-home"></i> Back to Dashboard
        </Button>
      </div>

      <div className="vendor-page-header">
        <h2 className="vendor-page-title">🏢 Vendors</h2>
        <p className="vendor-page-subtitle">Manage your vendor relationships</p>
      </div>

  


      {/*  TOOLBAR  */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <InputGroup className="search-bar w-50">
          <FormControl
            placeholder="Search vendors by name, contact, phone, or status..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <div className="d-flex gap-2">
          <Button
            className="vendor-action-btn vendor-action-btn-primary"
            onClick={() => { resetForm(); setShowModal(true); }}
          >
            Add Vendor
          </Button>

          <Button
            className="vendor-action-btn vendor-action-btn-secondary"
            variant="outline-success"
            onClick={() => downloadCSV('vendors.csv', filteredVendors)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/*  TABLE  */}
      <div className="vendor-table-container">
        <Table striped hover className="vendor-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Contact Person</th>
              <th>Phone</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center vendor-empty-state">
                  No vendors found
                </td>
              </tr>
            ) : (
              filteredVendors.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.name}</td>
                  <td>{v.contactPerson}</td>
                  <td>{v.phone}</td>
                  <td>{v.status}</td>
                  <td>
                    <Button
                      className="table-action-btn table-action-btn-warning me-2"
                      size="sm"
                      onClick={() => handleEdit(v)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="table-action-btn table-action-btn-danger"
                      size="sm"
                      onClick={() => handleDelete(v.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/*  MODAL  */}
      <Modal show={showModal} onHide={resetForm} className="vendor-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="vendor-form">
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Vendor name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="John Smith"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+33 1 23 45 67 89"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="ARCHIVED">Archived</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lead Time (Days)</Form.Label>
              <Form.Control
                name="leadTimeDays"
                type="number"
                value={formData.leadTimeDays}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Minimum Order Value</Form.Label>
              <Form.Control
                name="minimumOrderValue"
                type="number"
                step="0.01"
                value={formData.minimumOrderValue}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                name="notes"
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="vendor-action-btn" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            className="vendor-action-btn vendor-action-btn-primary"
            onClick={handleSave}
          >
            {editingVendor ? 'Update' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VendorPage;