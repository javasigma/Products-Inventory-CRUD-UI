// src/components/AiChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Offcanvas,
  Card,
  Form,
  Spinner,
  Badge,
  Container,
  Row,
  Col
} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { aiQuery } from '../api/api';
import './AiChatWidget.css';
import PropTypes from 'prop-types'; // ✅ Import PropTypes

const AiChatWidget = ({ initialPrompt = '' }) => { // ✅ Add initialPrompt prop
  const location = useLocation();
  const isPage = location.pathname === '/ai-chat';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your inventory AI assistant. I can help you with:\n\n• Stock levels and low inventory alerts\n• Sales data and revenue insights\n• Product performance analysis\n• Vendor information\n• Sales trends and forecasting\n\nTry asking: \"Show me low stock items\" or \"What are my top selling products?\""
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ Effect to handle initial prompt from dashboard
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      console.log("🚀 [AiChatWidget] Received initial prompt:", initialPrompt);
      
      // Set the input field with the prompt
      setInput(initialPrompt);
      
      // Auto-open the chat widget when prompt is provided
      if (!isOpen) {
        setIsOpen(true);
      }
      
      // Optional: Auto-submit after a short delay when widget opens
      const autoSubmit = setTimeout(() => {
        if (isOpen && initialPrompt === input) {
          console.log("🚀 [AiChatWidget] Auto-submitting prompt...");
          handleAutoSubmit(initialPrompt);
        }
      }, 500);
      
      return () => clearTimeout(autoSubmit);
    }
  }, [initialPrompt, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Separate function for auto-submitting initial prompts
  const handleAutoSubmit = async (promptText) => {
    if (!promptText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: promptText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiQuery(promptText, 'sql');
      const aiResponse = {
        role: 'assistant',
        content: response.text,
        data: response.data
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('AI Query error:', err);
      const errorMessage = {
        role: 'assistant',
        content:
          'Sorry, I encountered an error while processing your request. Please try again.'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiQuery(input, 'sql');
      console.log("🚀 Backend response:", response);
      const aiResponse = {
        role: 'assistant',
        content: response.text,
        data: response.data
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('AI Query error:', err);
      const errorMessage = {
        role: 'assistant',
        content:
          'Sorry, I encountered an error while processing your request. Please try again.'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (q) => {
    setInput(q);
    // Use setTimeout to ensure state update before submit
    setTimeout(() => {
      const submitEvent = new Event('submit', { bubbles: true });
      document.getElementById('ai-chat-form')?.dispatchEvent(submitEvent);
    }, 100);
  };

  const formatData = (data) => {
    if (!data) return null;

    if (Array.isArray(data) && data.length > 0) {
      return (
        <div className="data-table mt-2">
          <Card className="border-0 bg-light">
            <Card.Body className="p-2">
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                <table className="table table-sm table-borderless mb-0">
                  <thead>
                    <tr>
                      {Object.keys(data[0]).map((key) => (
                        <th key={key} className="text-muted small border-bottom">
                          {key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (s) => s.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="small">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </div>
      );
    }

    return (
      <pre className="data-raw mt-2 p-2 bg-light rounded small">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! How can I help you with your inventory today?'
      }
    ]);
    setInput(''); // ✅ Clear input when clearing chat
  };

  /** =========================================================
   *  COMMON CHAT UI (used in both page and offcanvas)
   * ========================================================= */
  const chatContent = (
    <>
      {messages.length <= 1 && (
        <div className="quick-questions p-3 border-bottom bg-light">
          <small className="text-muted d-block mb-2">Quick questions:</small>
          <div className="d-flex flex-wrap gap-2">
            {[
              'Show low stock items',
              'Top selling products',
              'Recent sales',
              'Vendor information',
              'Customer details',
              'Predict demand',
              'Business performance',
              'Inventory overview',
              'Growth opportunities',
              'Monthly revenue'
            ].map((question, index) => (
              <Button
                key={index}
                variant="outline-primary"
                size="sm"
                className="rounded-pill"
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-grow-1 overflow-y-auto p-3 messages-container">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`d-flex mb-3 ${
              msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'
            }`}
          >
            <div
              className={`message-bubble ${
                msg.role === 'user' ? 'user-message' : 'assistant-message'
              }`}
              style={{ maxWidth: '85%' }}
            >
              <div className="message-content">
                {msg.content.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
                {msg.data && formatData(msg.data)}
              </div>
              <small className="text-muted message-time">
                {msg.role === 'user' ? 'You' : 'Assistant'} •{' '}
                {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="d-flex justify-content-start mb-3">
            <div className="assistant-message">
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span className="text-muted">Analyzing your data...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-top bg-light p-3">
        <Form onSubmit={handleSubmit} id="ai-chat-form">
          <Form.Group className="d-flex gap-2">
            <Form.Control
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about inventory, sales, or stock levels..."
              disabled={isLoading}
              className="flex-grow-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || isLoading}
              className="d-flex align-items-center gap-1"
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <span>↗</span>
                </>
              )}
            </Button>
          </Form.Group>
        </Form>
        <small className="text-muted mt-2 d-block">
          Ask about products, sales, vendors, or stock levels
        </small>
      </div>
    </>
  );

  /** =========================================================
   *  RENDER  – page mode vs floating + offcanvas
   * ========================================================= */
  if (isPage) {
    return (
      <Container fluid className="ai-chat-page py-4">
        <Row>
          <Col md={10} lg={8} xl={6} className="mx-auto">
            <Card
              className="shadow-lg border-0"
              style={{ borderRadius: '1.25rem', overflow: 'hidden' }}
            >
              <Card.Header className="d-flex justify-content-between align-items-center px-4 py-3 bg-light">
                <h6 className="mb-0 fw-semibold text-primary">
                  AKSEMA Inventory AI Assistant
                </h6>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={clearChat}
                >
                  <span>🗑️</span>
                  <span className="d-none d-sm-inline">Clear</span>
                </Button>
              </Card.Header>
              <Card.Body className="p-0 d-flex flex-column" style={{ height: '70vh' }}>
                {chatContent}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        className="fixed-bottom end-3 mb-4 rounded-circle p-3 shadow-lg ai-chat-btn"
        onClick={() => setIsOpen(true)}
        style={{
          zIndex: 1000,
          width: '60px',
          height: '60px',
          fontSize: '1.5rem',
          border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
        }}
      >
        🤖
        {messages.length > 1 && (
          <Badge
            bg="danger"
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.6rem' }}
          >
            {messages.length - 1}
          </Badge>
        )}
      </Button>

      <Offcanvas
        show={isOpen}
        onHide={() => setIsOpen(false)}
        placement="end"
        style={{ width: '600px' }}
        className="ai-chat-offcanvas"
      >
        <Offcanvas.Header className="border-bottom bg-light">
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
              style={{ width: '32px', height: '32px' }}
            >
              <span style={{ fontSize: '1rem' }}>🤖</span>
            </div>
            <div>
              <Offcanvas.Title className="h6 mb-0">
                AI Assistant
              </Offcanvas.Title>
              <small className="text-muted">Powered by your business data</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-danger"
              size="md"
              onClick={clearChat}
              title="Clear chat"
            >
              🗑️
            </Button>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column p-0">
          {chatContent}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};


// Add this at the bottom of AiChatWidget.jsx
AiChatWidget.propTypes = {
  initialPrompt: PropTypes.string
};

AiChatWidget.defaultProps = {
  initialPrompt: ''
};

export default AiChatWidget;