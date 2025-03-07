import React, { useState } from 'react';
import './FooterHr.css';

const FooterHr = () => {
  const [activeColumn, setActiveColumn] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim() !== '') {
      setIsSubscribed(true);
      setEmailInput('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const toggleColumn = (index) => {
    setActiveColumn(activeColumn === index ? null : index);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footerhr">
      <div className="footerhr-container">
        <div className="footerhr-left">
          <div className="footerhr-logo">
            <span className="footerhr-logo-icon">⨁</span>
            <span className="footerhr-logo-text">Hyre</span>
          </div>
          
          <p className="footerhr-tagline">Simplifying HR management for growing businesses</p>
          
          <address className="footerhr-address">
            2774 Oak Drive, Plattsburgh, New York<br />
            <a href="tel:+15100000000">510-000-0000</a><br />
            <a href="mailto:contact@hyre.com">contact@hyre.com</a>
          </address>
          
          <form className="footerhr-subscribe" onSubmit={handleSubscribe}>
            <label htmlFor="footer-email">Stay updated with our newsletter</label>
            <div className="footerhr-input-group">
              <input 
                type="email" 
                id="footer-email" 
                placeholder="Enter your email" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </div>
            {isSubscribed && <p className="footerhr-success">Thanks for subscribing!</p>}
          </form>
          
          <div className="footerhr-social-links">
            <a href="#" className="footerhr-social-icon" aria-label="Facebook">
              <i className="fa-facebook">f</i>
            </a>
            <a href="#" className="footerhr-social-icon" aria-label="Twitter">
              <i className="fa-twitter">t</i>
            </a>
            <a href="#" className="footerhr-social-icon" aria-label="LinkedIn">
              <i className="fa-linkedin">in</i>
            </a>
            <a href="#" className="footerhr-social-icon" aria-label="Instagram">
              <i className="fa-instagram">i</i>
            </a>
            <a href="#" className="footerhr-social-icon" aria-label="YouTube">
              <i className="fa-youtube">y</i>
            </a>
          </div>
        </div>
        
        <div className="footerhr-right">
          <div className={footerhr-column ${activeColumn === 0 ? 'active' : ''}}>
            <h3 onClick={() => toggleColumn(0)}>
              About Us <span className="toggle-icon">{activeColumn === 0 ? '−' : '+'}</span>
            </h3>
            <ul className="footerhr-links">
              <li><a href="#">Book a Demo</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          
          <div className={footerhr-column ${activeColumn === 1 ? 'active' : ''}}>
            <h3 onClick={() => toggleColumn(1)}>
              Features <span className="toggle-icon">{activeColumn === 1 ? '−' : '+'}</span>
            </h3>
            <ul className="footerhr-links">
              <li><a href="#">Applicant Tracking</a></li>
              <li><a href="#">Performance Reviews</a></li>
              <li><a href="#">Time Tracking</a></li>
              <li><a href="#">Payroll Integration</a></li>
              <li><a href="#">Sign In</a></li>
              <li><a href="#">Sign Up</a></li>
            </ul>
          </div>
          
          <div className={footerhr-column ${activeColumn === 2 ? 'active' : ''}}>
            <h3 onClick={() => toggleColumn(2)}>
              Resources <span className="toggle-icon">{activeColumn === 2 ? '−' : '+'}</span>
            </h3>
            <ul className="footerhr-links">
              <li><a href="#">Style Guide</a></li>
              <li><a href="#">Changelog</a></li>
              <li><a href="#">Licenses</a></li>
              <li><a href="#">More Templates</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footerhr-bottom">
        <div className="footerhr-bottom-container">
          <p>© {currentYear} Hyre. All rights reserved.</p>
          
          <div className="footerhr-links">
            <a href="#">Privacy Policy</a>
            <span className="footerhr-separator">•</span>
            <a href="#">Terms of Service</a>
            <span className="footerhr-separator">•</span>
            <a href="#">Cookies Settings</a>
          </div>
          
          <p className="footerhr-credits">
            Designed with <span className="footerhr-heart">♥</span> by DesignUp
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterHr;