import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTicket.css';

function CreateTicket() {
  const [ticket, setTicket] = useState({
    title: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/v1/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: ticket.title,
          description: ticket.description,
          contact_info: {
            name: ticket.contactName,
            email: ticket.contactEmail,
            phone: ticket.contactPhone
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create ticket');
      }
      
      const data = await response.json();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket">
      <h1>Create New Support Ticket</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Ticket Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={ticket.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={ticket.description}
            onChange={handleChange}
            rows="6"
            required
          />
        </div>
        
        <h2>Contact Information</h2>
        
        <div className="form-group">
          <label htmlFor="contactName">Name</label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={ticket.contactName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contactEmail">Email</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={ticket.contactEmail}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contactPhone">Phone (optional)</label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={ticket.contactPhone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;