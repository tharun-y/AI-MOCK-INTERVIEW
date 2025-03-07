import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './hroruser.css';

const HrOrUser = () => {
  const [selectedOption, setSelectedOption] = useState(1);
  const navigate = useNavigate();
  
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };
  
  const handleCreateAccount = () => {
    if (selectedOption === 1) {
      navigate('/hr');
    } else if (selectedOption === 2) {
      navigate('/user');
    }
  };
  
  return (
    <div className="hroruser-container">
      {/* Logo */}
      <div className="hroruser-logo" style={{marginLeft:'37%'}}>
      <div className="hroruser-logo-accent" style ={{borderRadius:'50%' , backgroundColor : 'black',border : '2px solid neon' , marginRight:'10px'}}>  </div>
        <div className="hroruser-logo-text"> INTELLIHIRE</div>
      </div>
      
      {/* Header with Mock Interview Theme */}
      <div className="hroruser-mock-interview-header">
        <h1 className="hroruser-title">
          How do you want to use<br />MockPrep?
        </h1>
        <p className="hroruser-subtitle">
          We'll personalize your setup experience accordingly.
        </p>
      </div>
      
      {/* Option Cards */}
      <div className="hroruser-options">
        {/* Option 1 - Companies/HR */}
        <div 
          className={`hroruser-option-card ${selectedOption === 1 ? 'hroruser-active' : ''}`}
          onClick={() => handleOptionSelect(1)}
        >
          <div className="hroruser-option-icon">
            <span role="img" aria-label="search">🔍</span>
          </div>
          <div className="hroruser-option-content">
            <h3 className="hroruser-option-title">I'm here to hire tech talent</h3>
            <p className="hroruser-option-description">
              Evaluate tech skills at scale
            </p>
          </div>
          <span className="hroruser-option-badge">Free trial</span>
        </div>
        
        {/* Option 2 - Developers */}
        <div 
          className={`hroruser-option-card ${selectedOption === 2 ? 'hroruser-active' : ''}`}
          onClick={() => handleOptionSelect(2)}
        >
          <div className="hroruser-option-icon">
            <span role="img" aria-label="computer">💻</span>
          </div>
          <div className="hroruser-option-content">
            <h3 className="hroruser-option-title">
              I'm here to practice and prepare
            </h3>
            <p className="hroruser-option-description">
              Solve problems and learn new skills
            </p>
          </div>
        </div>
      </div>
      
      {/* Create Account Button */}
      <button className="hroruser-button" onClick={handleCreateAccount}>
        Create account
      </button>
    </div>
  );
};

export default HrOrUser;