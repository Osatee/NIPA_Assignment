import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTicket.css';

function CreateTicket() {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState({
    title: '',
    description: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    status: 'pending',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket((prev) => ({
      ...prev,
      [name]: value,
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
        body: JSON.stringify(ticket),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket">
      <h1>Create New Ticket</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
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
            rows="4"
            required
          />
        </div>

        <h2>Contact Information</h2>

        <div className="form-group">
          <label htmlFor="contact_name">Name</label>
          <input
            type="text"
            id="contact_name"
            name="contact_name"
            value={ticket.contact_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact_email">Email</label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            value={ticket.contact_email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact_phone">Phone</label>
          <input
            type="tel"
            id="contact_phone"
            name="contact_phone"
            value={ticket.contact_phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Ticket Status</label>
          <select id="status" name="status" value={ticket.status} onChange={handleChange} required>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button type="submit" className="btn btn-create" disabled={loading}>
          {loading ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  );
}

export default CreateTicket;
