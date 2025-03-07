import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import "./HeaderHr.css";

const HeaderHr = () => {
  return (
    <header className="headerhr-header">
      <div className="headerhr-logo-container">
        <div className="headerhr-logo-circle"></div>
        <span className="headerhr-brand-name">IntelliHire</span>
      </div>

      <nav className="headerhr-main-nav">
        <ul>
          <li><Link to="/hr" style={{ textDecoration: 'none' }}>Home</Link></li>
          <li><Link to="/hr/interviews" style={{ textDecoration: 'none' }}>Interviews</Link></li>
          <li><Link to="/hr/aboutus" style={{ textDecoration: 'none' }}>About Us</Link></li>
        </ul>
      </nav>

      <div className="headerhr-cta-container">
        <div className="headerhr-auth-buttons">
          <SignedOut>
            <SignInButton mode="modal" className="headerhr-sign-in-button">
              Sign In
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "headerhr-user-btn"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default HeaderHr;