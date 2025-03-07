// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './dashboard.css';
import Footer from '../Footer';
import Header from '../Header';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [feedbacks, setFeedbacks] = useState([]); // Stores all valid feedback items
  const [selectedFeedback, setSelectedFeedback] = useState(null); // Stores the clicked feedback

  // Set username and email from the authenticated Clerk user
  useEffect(() => {
    if (user) {
      setUsername(user.firstName || 'User');
      // Use the user's primary email as the authentication parameter
      setEmail(user.primaryEmailAddress?.emailAddress || '');
    }
  }, [user]);

  // Fetch feedback entries for the authenticated user
  useEffect(() => {
    const fetchAllFeedback = async () => {
      if (!email) return; // Ensure email is available
      
      const authenticate = email;
      const fetchedFeedbacks = [];
      let feedbackId = 1;
      let continueFetching = true;
      
      while (continueFetching) {
        try {
          const response = await fetch('http://localhost:5000/interview/feedback/list', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              authenticate,
              feedbackId
            })
          });

          if (response.status === 400) {
            // Stop fetching further feedbacks.
            continueFetching = false;
            break;
          }
          
          if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            continueFetching = false;
            break;
          }
          
          const data = await response.json();
          
          if (data.success) {
            fetchedFeedbacks.push({
              feedbackId,
              questionAnswers: data.data.questionAnswers,
              overallFeedback: data.data.overallFeedback,
            });
          } else {
            // If success is false, stop fetching further entries.
            continueFetching = false;
            break;
          }
          
          // Increment feedbackId to fetch the next feedback record.
          feedbackId++;
        } catch (error) {
          console.error('Network or parsing error:', error);
          continueFetching = false;
          break;
        }
      }
      
      setFeedbacks(fetchedFeedbacks);
      // Print all fetched feedbacks to the console
      console.log("Fetched Feedbacks:", fetchedFeedbacks);
    };
    
    fetchAllFeedback();
  }, [email]);

  return (
    <div className="app">
      <Header />
      
      <main className="dashboard">
        <div className="dashboard-header">
          <h1 className="welcome-text">
            Dashboard <span className="welcome-name">Welcome, {username}</span>
          </h1>
          
          <div className="user-details">
            <Link to="/user/dash/profile"><button className="view-details-btn">
              <i className="fas fa-eye"></i> View Profile
            </button></Link>
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">
              <i className="fas fa-file-alt"></i> Total Interviews
            </div>
            <div className="stat-value">{feedbacks.length}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">
              <i className="fas fa-trophy"></i> Best Score
            </div>
            <div className="stat-value">N/A</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">
              <i className="fas fa-chart-line"></i> Improvement Rate
            </div>
            <div className="stat-value">0%</div>
          </div>
        </div>
        
        <div className="action-card">
          <div className="action-header">
            <div className="action-title">
              <i className="fas fa-bolt action-icon"></i> Create AI Mock Interview
            </div>
          </div>
          
          <div className="add-new-container" onClick={() => navigate('/user/dash/Interview')}>
            <div className="add-new-btn">
              <i className="fas fa-plus"></i> +Add New
            </div>
          </div>
        </div>
        <button
          className="view-details-btn"
          style={{ display: 'flex', justifyContent: 'center' ,width:'15%', marginLeft: '42.5%' ,fontSize: '20px'}}
          onClick={() => navigate('/user/dash/joinInterview')}
        >
          <i className="fas fa-link"></i> Join Interview
        </button>

        {/* Feedback Boxes Section */}
        <div className="feedback-box-container">
          <h2 className="feedback-box-title">Your Feedbacks</h2>
          <div className="feedback-boxes">
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <div
                  key={feedback.feedbackId}
                  className="feedback-box"
                  onClick={() => setSelectedFeedback(feedback)}
                >
                  FEEDBACK {feedback.feedbackId}
                </div>
              ))
            ) : (
              <div>No feedback available</div>
            )}
          </div>
        </div>

        {/* Display selected feedback details when a box is clicked */}
        {selectedFeedback && (
          <div className="feedback-details">
            <h3>Feedback ID: {selectedFeedback.feedbackId}</h3>
            <p><strong>Overall Feedback:</strong> {selectedFeedback.overallFeedback}</p>
            {selectedFeedback.questionAnswers && selectedFeedback.questionAnswers.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Questions & Answers:</strong>
                <ul>
                  {selectedFeedback.questionAnswers.map((qa, index) => (
                    <li key={index}>
                      <strong>Q:</strong> {qa.question} <br />
                      <strong>A:</strong> {qa.answerbyAI}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Button to close the feedback details */}
            <button onClick={() => setSelectedFeedback(null)}>Close</button>
          </div>
        )}

        {/* Removed the history-container to prevent automatic display of feedbacks */}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
