import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const statusQuery = statusFilter === 'all' ? '' : `&status=${statusFilter}`;
      const sortQuery = `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      const response = await fetch(`http://localhost:8080/api/v1/tickets/?${statusQuery}${sortQuery}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
    
      let data = await response.json();
    
      if (data.tickets) {
        data.tickets.sort((a, b) => {
          if (sortBy === 'updated_at') {
            return sortOrder === 'asc' 
              ? new Date(a.updated_at) - new Date(b.updated_at) 
              : new Date(b.updated_at) - new Date(a.updated_at);
          }
          if (sortBy === 'created_at') {
            return sortOrder === 'asc' 
              ? new Date(a.created_at) - new Date(b.created_at)
              : new Date(b.created_at) - new Date(a.created_at);
          }
          if (sortBy === 'title') {
            return sortOrder === 'asc' 
              ? a.title.localeCompare(b.title) 
              : b.title.localeCompare(a.title);
          }
          return 0;
        });
      }

      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, sortOrder]);
  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    setSortOrder(newSortBy === 'created_at' ? 'asc' : 'desc');
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

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  const nextPage = () => {
    if (currentPage < Math.ceil(tickets.length / ticketsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
          <select id="statusFilter" value={statusFilter} onChange={handleStatusChange}>
            <option value="all">All Tickets</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="sortBy">Sort by:</label>
          <select id="sortBy" value={sortBy} onChange={handleSortChange}>
            <option value="updated_at">Latest Update</option>
            <option value="created_at">Creation Date</option>
            <option value="title">Title</option>
          </select>
          <button className="btn-sort-order" onClick={toggleSortOrder}>
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
          {currentTickets.map(ticket => (
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
                <span className="ticket-date">Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span> Page {currentPage} of {Math.ceil(tickets.length / ticketsPerPage)} </span>
        <button onClick={nextPage} disabled={currentPage === Math.ceil(tickets.length / ticketsPerPage)}>Next</button>
      </div>
    </div>
  );
}

export default Dashboard;
