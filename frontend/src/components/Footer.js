 
// src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__section">
            <h4>About NDAP</h4>
            <ul>
              <li><a href="#about">About Platform</a></li>
              <li><a href="#vision">Vision & Mission</a></li>
              <li><a href="#team">Our Team</a></li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4>Data & Resources</h4>
            <ul>
              <li><a href="#datasets">Browse Datasets</a></li>
              <li><a href="#api">Developer API</a></li>
              <li><a href="#tools">Analysis Tools</a></li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#feedback">Feedback</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p>© 2024 National Data & Analytics Platform, Government of India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
