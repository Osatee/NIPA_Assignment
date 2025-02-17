import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Helpdesk Ticket System</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className="nav-item">Dashboard</Link>
        <Link to="/create" className="nav-item">Create Ticket</Link>
      </div>
    </nav>
  );
}

export default Navbar;