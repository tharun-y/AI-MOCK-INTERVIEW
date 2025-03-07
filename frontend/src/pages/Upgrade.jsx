import React from 'react';
import './Upgrade.css'; // Import the CSS file
import Footer from '../Footer';
import Header from '../Header';
const PricingSection = () => {
  return (

<div>
<Header />

    <div className="pricing-section">
        
        
      <div className="pricing-container">
      
        <div className="pricing-header text-center">
        
          <h1 className="pricing-title">
            Choose Your Interview Assistant Plan
          </h1>
          <p className="pricing-subtitle">
            Elevate your interview skills with our AI-powered mock interview platform. Select the plan that fits your career goals perfectly.
          </p>
        </div>
        
        <div className="pricing-plans-grid">
          {/* Basic Plan */}
          <div className="plan-card basic">
            <h2 className="plan-title">Basic</h2>
            <p className="plan-description">Ideal for beginners preparing for their initial interviews</p>
            <div className="plan-pricing">
              <div className="plan-price">$9</div>
              <div className="plan-period">per month</div>
            </div>
            <ul className="plan-features">
              <li><span className="check-mark">✓</span> 5 AI interview simulations</li>
              <li><span className="check-mark">✓</span> Basic feedback on responses</li>
              <li><span className="check-mark">✓</span> General interview questions</li>
              <li><span className="check-mark">✓</span> Email support</li>
            </ul>
            <button className="plan-button">Start Free Trial</button>
          </div>
          
          {/* Professional Plan */}
          <div className="plan-card professional">
            <span className="popular-badge">Most Popular</span>
            <h2 className="plan-title">Professional</h2>
            <p className="plan-description">Comprehensive preparation for serious job seekers</p>
            <div className="plan-pricing">
              <div className="plan-price">$19</div>
              <div className="plan-period">per month</div>
            </div>
            <ul className="plan-features">
              <li><span className="check-mark">✓</span> Unlimited interview simulations</li>
              <li><span className="check-mark">✓</span> Detailed response analysis</li>
              <li><span className="check-mark">✓</span> Industry-specific questions</li>
              <li><span className="check-mark">✓</span> Technical skills assessment</li>
              <li><span className="check-mark">✓</span> Interview performance tracking</li>
              <li><span className="check-mark">✓</span> Priority support</li>
            </ul>
            <button className="plan-button active">Get Started</button>
          </div>
          
          {/* Enterprise Plan */}
          <div className="plan-card enterprise">
            <h2 className="plan-title">Enterprise</h2>
            <p className="plan-description">Tailored for organizations training multiple candidates</p>
            <div className="plan-pricing">
              <div className="plan-price">$49</div>
              <div className="plan-period">per user/month</div>
            </div>
            <ul className="plan-features">
              <li><span className="check-mark">✓</span> Everything in Professional</li>
              <li><span className="check-mark">✓</span> Custom interview scenarios</li>
              <li><span className="check-mark">✓</span> Company-specific questions</li>
              <li><span className="check-mark">✓</span> Bulk user management</li>
              <li><span className="check-mark">✓</span> Admin dashboard & analytics</li>
              <li><span className="check-mark">✓</span> Dedicated account manager</li>
              <li><span className="check-mark">✓</span> Custom HR integrations</li>
            </ul>
            <button className="plan-button">Contact Sales</button>
          </div>
        </div>
        
        <div className="pricing-footer text-center">
          All plans include a 7-day free trial. No credit card required to start. Prices exclude applicable taxes.
        </div>
        <br></br>
        <br></br>
      </div>
    </div>
      <Footer />
    </div>

  );
};

export default PricingSection;