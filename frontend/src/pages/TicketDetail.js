import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TicketDetail.css';

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTicket, setUpdatedTicket] = useState({});

  const fetchTicket = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/tickets/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      
      const data = await response.json();
      setTicket(data);
      setUpdatedTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTicket(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8080/api/v1/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTicket),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }
      
      const data = await response.json();
      setTicket(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }
      
      const data = await response.json();
      setTicket(data);
      setUpdatedTicket(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && !ticket) return <div className="loading">Loading ticket details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!ticket) return <div className="not-found">Ticket not found</div>;

  return (
    <div className="ticket-detail">
      <div className="ticket-detail-header">
        <button className="btn btn-back" onClick={() => navigate('/')}>Back to Dashboard</button>
        <h1>Ticket #{ticket.id}</h1>
        <div className={`ticket-status status-${ticket.status}`}>
          {ticket.status}
        </div>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={updatedTicket.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={updatedTicket.description}
              onChange={handleChange}
              rows="6"
              required
            />
          </div>
          
          <h2>Contact Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={updatedTicket.contact_name}
              onChange={handleContactChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={updatedTicket.contact_email}
              onChange={handleContactChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={updatedTicket.contact_phone || ''}
              onChange={handleContactChange}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="btn btn-cancel"
              onClick={() => {
                setUpdatedTicket(ticket);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="ticket-content">
          <div className="ticket-section">
            <h2>{ticket.title}</h2>
            <p className="ticket-description">{ticket.description}</p>
          </div>
          
          <div className="ticket-section">
            <h3>Contact Information</h3>
            <div className="contact-info">
              <p><strong>Name:</strong> {ticket.contact_name}</p>
              <p><strong>Email:</strong> {ticket.contact_email}</p>
              {ticket.contact_phone && (
                <p><strong>Phone:</strong> {ticket.contact_phone}</p>
              )}
            </div>
          </div>
          
          <div className="ticket-section">
            <h3>Ticket Details</h3>
            <p><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
          </div>
          
          <div className="ticket-actions">
            <button 
              className="btn btn-edit"
              onClick={() => setIsEditing(true)}
            >
              Edit Ticket
            </button>
          </div>
          
          <div className="status-actions">
            <h3>Update Status</h3>
            <div className="status-buttons">
              <button 
                className={`btn-status ${ticket.status === 'pending' ? 'active' : ''}`}
                onClick={() => handleStatusChange('pending')}
                disabled={ticket.status === 'pending'}
              >
                Pending
              </button>
              <button 
                className={`btn-status ${ticket.status === 'accepted' ? 'active' : ''}`}
                onClick={() => handleStatusChange('accepted')}
                disabled={ticket.status === 'accepted'}
              >
                Accept
              </button>
              <button 
                className={`btn-status ${ticket.status === 'resolved' ? 'active' : ''}`}
                onClick={() => handleStatusChange('resolved')}
                disabled={ticket.status === 'resolved'}
              >
                Resolve
              </button>
              <button 
                className={`btn-status ${ticket.status === 'rejected' ? 'active' : ''}`}
                onClick={() => handleStatusChange('rejected')}
                disabled={ticket.status === 'rejected'}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketDetail;