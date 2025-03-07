import React from "react";
import "./hrMain.css";
import dashboardmockup from "../Images/techstack.jpg";
import HeaderHr from "./HeaderHr";
import Footer from "../Footer";
import { Link } from "react-router-dom";


const HrMain = () => {
  return (
    <div className="hrmain-container">
      <HeaderHr />
      <section className="hrmain-hero-section">
        <div className="hrmain-hero-content">
          <h1 className="hrmain-hero-title">
            Hire the <span className="hrmain-highlight">top</span> candidates
            <br /> for your startup
          </h1>
          <p className="hrmain-hero-description">
            Leverage world-class talented people. Interview pre-screened top 0.1%
            <br /> candidates from different fields and start collaborating.
          </p>
          <Link to="/hr/interviews" style = {{textDecoration:'none'}}><button className="hrmain-primary-cta">
            Hire top talent <span className="hrmain-arrow">→</span>
          </button></Link>
        </div>

        {/* Candidate Profiles */}
        <div className="hrmain-candidate-profiles">
          {[
            { name: "CHRIS PETE", role: "DevOps Engineer", color: "yellow" },
            { name: "JIM CARLSON", role: "Growth Marketing", color: "purple" },
            { name: "MARTHA GRACE", role: "UX/UI Designer", color: "pink" },
            { name: "ANNA DEAN", role: "Backend Engineer", color: "blue" },
            { name: "MIKE ONEAL", role: "Product Designer", color: "green" },
          ].map((candidate, index) => (
            <div key={index} className={`hrmain-profile-card hrmain-${candidate.color}`}>
              <h3 className="hrmain-candidate-name">{candidate.name}</h3>
              <p className="hrmain-candidate-role">{candidate.role}</p>
              <div className="hrmain-candidate-image"></div>
            </div>
          ))}
        </div>
      </section>

      <div className="hrmain-curved-bg"></div>

      {/* Mobile Menu Button */}
      <button className="hrmain-menu-btn" aria-label="Open Menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="2" fill="#FFFFFF" />
          <rect x="3" y="11" width="18" height="2" fill="#FFFFFF" />
          <rect x="3" y="17" width="18" height="2" fill="#FFFFFF" />
        </svg>
      </button>

      {/* Feature Section */}
      <section className="hrmain-features">
        {[
          { title: "64% Faster Hiring", text: "No more back and forth to find the right qualified candidates." },
          { title: "Decrease spendings", text: "Find the right candidates and pay cheaper than the market price." },
          { title: "Top 0.1% candidates", text: "Find highly skilled candidates with top-level expertise." }
        ].map((feature, index) => (
          <div key={index} className="hrmain-feature">
            <div className="hrmain-feature-icon" role="img">
              <svg width="24" height="24" fill="none">
                <rect width="20" height="20" x="2" y="2" rx="2" stroke="#1dbd5f" strokeWidth="2" />
                <path d="M8 12L11 15L16 9" stroke="#1dbd5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </div>
        ))}
      </section>

      {/* Secondary Hero Section */}
      <section className="hrmain-hero-secondary">
        <div className="hrmain-hero-content">
          <h1 className="hrmain-hero-title">
            Find your perfect candidate in all industries
          </h1>
          <h2 className="hrmain-hero-subtitle">
            Employees come and go. Quality stays.
          </h2>
          <p className="hrmain-hero-description">
            World's largest distributed network of top designers, developers, copywriters and other talents.
          </p>

          <div className="hrmain-hero-badges">
            {[
              { text: "Fully onboarded" },
              { text: "Super positive feedback" }
            ].map((badge, index) => (
              <div key={index} className="hrmain-badge">
                <div className="hrmain-badge-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#1dbd5f" strokeWidth="2" fill="#1dbd5f" />
                  </svg>
                </div>
                <span className="hrmain-badge-text">{badge.text}</span>
              </div>
            ))}
          </div>

          <div className="hrmain-hero-actions">
            <Link to="/hr/interviews"  style={{textDecoration : 'none'}} className="hrmain-btn hrmain-btn-primary">Start for free</Link>
            
          </div>
        </div>

        <div className="hrmain-hero-image">
          <img src={dashboardmockup} alt="Dashboard mockup" />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HrMain;