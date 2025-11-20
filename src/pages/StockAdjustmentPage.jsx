// src/pages/StockAdjustmentPage.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, 
  Alert, Spinner } from 'react-bootstrap';
import { fetchStockAdjustments, createStockAdjustment } from '../api/api';


const StockAdjustmentPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ productId: '', adjustmentType: 'INCREASE', quantity: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStockAdjustments();
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      // 👇 SAFETY CHECK: Handle any response format
      if (Array.isArray(data)) {
        setAdjustments(data);
      } else if (data && Array.isArray(data.data)) {
        setAdjustments(data.data); // Handle { success: true, data: [...] }
      } else {
        setAdjustments([]);
        console.warn('Unexpected stock adjustments response format:', data);
      }
    } catch (err) {
      setError(err.message);
      setAdjustments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createStockAdjustment(formData);
      setFormData({ productId: '', adjustmentType: 'INCREASE', quantity: 0 });
      setShowModal(false);
      loadAdjustments(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Loading stock adjustments...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={loadAdjustments}>Retry</Button>
      </Container>
    );
  }

  return (


    
    
    <div className="container mt-4">
      <h2>Stock Adjustments</h2>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Add Adjustment
      </Button>

      <Table striped hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product ID</th>
            <th>Type</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {adjustments.map((adj) => (
            <tr key={adj.id}>
              <td>{adj.id}</td>
              <td>{adj.productId}</td>
              <td>{adj.adjustmentType}</td>
              <td>{adj.quantity}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Stock Adjustment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product ID</Form.Label>
              <Form.Control
                type="text"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adjustment Type</Form.Label>
              <Form.Select
                value={formData.adjustmentType}
                onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value })}
              >
                <option value="INCREASE">Increase</option>
                <option value="DECREASE">Decrease</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StockAdjustmentPage;