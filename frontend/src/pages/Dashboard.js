import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchTickets = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/tickets?status=${statusFilter}&sort=${sortBy}&order=${sortOrder}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, sortBy, sortOrder]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'resolved': return 'status-resolved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Loading tickets...</div>;
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Support Tickets</h1>
        <Link to="/create" className="btn btn-create">Create New Ticket</Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Status:</label>
          <select 
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">All Tickets</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="sortBy">Sort by:</label>
          <select 
            id="sortBy"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="updated_at">Latest Update</option>
            <option value="created_at">Creation Date</option>
            <option value="title">Title</option>
          </select>
          <button 
            className="btn-sort-order"
            onClick={toggleSortOrder}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      
      {tickets.length === 0 ? (
        <div className="no-tickets">
          <p>No tickets found. Create a new ticket to get started.</p>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map(ticket => (
            <Link to={`/tickets/${ticket.id}`} key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <h3>{ticket.title}</h3>
                <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <p className="ticket-desc">{ticket.description.substring(0, 150)}...</p>
              <div className="ticket-footer">
                <span className="ticket-id">ID: {ticket.id}</span>
                <span className="ticket-date">
                  Updated: {new Date(ticket.updated_at).toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;