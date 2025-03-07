import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import emailjs from 'emailjs-com';
import './joinInterview.css';
import Header from '../Header';
import Footer from '../Footer';

// EmailJS configuration (globals updated)
const JOININTERVIEW_SERVICE_ID = process.env.REACT_APP_JOININTERVIEW_SERVICE_ID;
const JOININTERVIEW_USER_ID = process.env.REACT_APP_JOININTERVIEW_USER_ID;
const JOININTERVIEW_SCORE_TEMPLATE_ID = process.env.REACT_APP_JOININTERVIEW_SCORE_TEMPLATE_ID;

// Helper function: Generate a password from an email
const generatePasswordFromEmail = (email) => {
  let sum = 0;
  for (let i = 0; i < email.length; i++) {
    sum += email.charCodeAt(i);
  }
  let pwd = sum.toString(36);
  while (pwd.length < 8) {
    pwd = '0' + pwd;
  }
  return pwd.slice(0, 8);
};

// Form Card Component
const FormCard = ({ form }) => {
  // Get candidate email from Clerk authentication
  const { user } = useUser();
  const candidateEmail = user
    ? user.primaryEmailAddress?.emailAddress ||
      user.phoneNumbers?.[0]?.phoneNumber ||
      ''
    : '';

  // Derive candidate name for display
  const candidateName = `${form.authenticate}-${form.formID}`;

  // Local states
  const [passwordInput, setPasswordInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState(null);
  const [answers, setAnswers] = useState(
    form.questions ? form.questions.map(() => '') : []
  );
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [scoreError, setScoreError] = useState(null);
  const [scoreMessage, setScoreMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form unlock
  const handleUnlock = (e) => {
    e.preventDefault();
    const correctPassword = generatePasswordFromEmail(form.authenticate);
    if (passwordInput === correctPassword) {
      setUnlocked(true);
      setUnlockError(null);
    } else {
      setUnlockError('Incorrect password. Please try again.');
    }
  };

  // Update answer for a given question
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Submit answers and calculate score
  const submitAnswers = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Calculate a score (total characters in all answers)
    const score = answers.reduce((acc, answer) => acc + answer.length, 0);

    const templateParams = {
      to_email: form.authenticate,
      candidate_email: candidateEmail,
      candidate_score: score,
    };

    try {
      const response = await emailjs.send(
        JOININTERVIEW_SERVICE_ID,
        JOININTERVIEW_SCORE_TEMPLATE_ID,
        templateParams,
        JOININTERVIEW_USER_ID
      );
      console.log(
        'Score email sent successfully:',
        response.status,
        response.text
      );
      setScoreMessage(`Score submitted successfully. Score: ${score}`);
      setScoreSubmitted(true);
      setScoreError(null);
    } catch (err) {
      console.error('Failed to send score email:', err);
      setScoreError('Failed to submit score. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="joininterview-form-card">
      <p className="joininterview-candidate-name">
        <strong>Candidate ID:</strong> {candidateName}
      </p>
      
      {!unlocked ? (
        <form className="joininterview-unlock-form" onSubmit={handleUnlock}>
          <input
            type="password"
            placeholder="Enter password to unlock questions"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button type="submit">Unlock Form</button>
          {unlockError && <p className="joininterview-error-message">{unlockError}</p>}
        </form>
      ) : !scoreSubmitted ? (
        <form onSubmit={submitAnswers}>
          <div>
            <p>
              <strong>Tech Stack:</strong> {form.techStack}
            </p>
            <p>
              <strong>Experience Level:</strong> {form.experience}
            </p>
            <p>
              <strong>Number of Questions:</strong> {form.numberOfQuestions}
            </p>
          </div>
          
          <div>
            <strong>Interview Questions:</strong>
            <ul>
              {form.questions &&
                form.questions.map((qObj, idx) => (
                  <li key={idx}>
                    <p>
                      <em>{qObj.question}</em>
                    </p>
                    <textarea
                      placeholder="Type your answer here..."
                      value={answers[idx]}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      rows="4"
                    />
                  </li>
                ))}
            </ul>
          </div>
          
          <button 
            type="submit" 
            className="joininterview-submit-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answers & Send Score'}
          </button>
          
          {scoreError && <p className="joininterview-error-message">{scoreError}</p>}
        </form>
      ) : (
        <p className="joininterview-success-message">{scoreMessage}</p>
      )}
    </div>
  );
};

// Main JoinInterview Component
const JoinInterview = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all forms from the backend
  useEffect(() => {
    fetch('http://localhost:5000/hrpage/hr/all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch interview forms');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setForms(data.data);
        } else {
          setError(data.message || 'No interview forms found.');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="joininterview-join-interview-container" style ={{marginLeft : '5%' ,width:'90%'}}>
      <Header/>
      <h1 className="joininterview-join-interview-title" style={{marginLeft:'32%'}} >Available Interview Forms</h1>
      
      {loading ? (
        <p className="joininterview-loading-message">Loading interview forms...</p>
      ) : error ? (
        <div className="joininterview-error-message">
          <p>Error: {error}</p>
          <p>Please refresh the page or try again later.</p>
        </div>
      ) : forms.length === 0 ? (
        <div className="joininterview-form-card">
          <p>No interview forms are currently available.</p>
        </div>
      ) : (
        forms.map((form, index) => (
          <FormCard key={form.formID || index} form={form} />
        ))
      )}
      <Footer />
    </div>
  );
};

export default JoinInterview;
