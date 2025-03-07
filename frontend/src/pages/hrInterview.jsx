import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import emailjs from 'emailjs-com'; // Make sure to install emailjs-com: npm install emailjs-com
import './hrInterview.css';
import HeaderHr from './HeaderHr';
import Footer from '../Footer';

// EmailJS configuration (replace these with your own keys)
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const USER_ID = process.env.REACT_APP_EMAILJS_USER_ID;


const HRInterview = () => {
  const { user } = useUser(); // Access authenticated user from Clerk

  // State for form data
  const [formData, setFormData] = useState({
    role: '',
    experience: '',
    numQuestions: 0,
    questions: [],
    authenticate: '' // Set dynamically via Clerk
  });

  const [submitted, setSubmitted] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Inspirational quotes
  const quotes = [
    "The best way to predict the future is to create it. - Peter Drucker",
    "Talent wins games, but teamwork and intelligence win championships. - Michael Jordan",
    "Hire character. Train skill. - Peter Schutz",
  ];
  const [quote, setQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  // Refresh quote function
  const refreshQuote = () => {
    let newQuote;
    do {
      newQuote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (newQuote === quote);
    setQuote(newQuote);
  };

  // Set authenticate field dynamically based on Clerk user data
  useEffect(() => {
    if (user) {
      const authenticateValue =
        user.primaryEmailAddress?.emailAddress ||
        user.phoneNumbers?.[0]?.phoneNumber ||
        '';
      setFormData((prevState) => ({
        ...prevState,
        authenticate: authenticateValue
      }));
    }
  }, [user]);

  // Helper function: Generate a password from the candidate's name by summing the ASCII values,
  // converting the total to a base36 string, and returning an 8-character string.
  const generatePasswordFromName = (name) => {
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    let pwd = sum.toString(36); // Convert the sum to a base36 string
    // Pad with zeros if needed to ensure at least 8 characters, then slice to exactly 8 characters
    while (pwd.length < 8) {
      pwd = '0' + pwd;
    }
    return pwd.slice(0, 8);
  };

  // Handle changes to role, experience, and number of questions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => {
      const updatedFormData = { ...prevState, [name]: value };
      if (name === 'numQuestions') {
        const num = parseInt(value, 10) || 0;
        updatedFormData.numQuestions = num;
        updatedFormData.questions = Array(num).fill('');
      }
      return updatedFormData;
    });
  };

  // Handle changes to individual questions
  const handleQuestionChange = (index, value) => {
    setFormData((prevState) => {
      const newQuestions = [...prevState.questions];
      newQuestions[index] = value;
      return { ...prevState, questions: newQuestions };
    });
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.role) {
      setError('Please select a role');
      return false;
    }
    if (!formData.experience) {
      setError('Please select an experience level');
      return false;
    }
    if (formData.numQuestions === 0) {
      setError('Please select the number of questions');
      return false;
    }
    if (formData.questions.some((q) => !q.trim())) {
      setError('Please fill in all questions');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!validateForm()) {
      setSubmitted(false);
      return;
    }

    try {
      // Convert questions from an array of strings to an array of objects with key 'question'
      const questionsPayload = formData.questions.map((q) => ({ question: q }));

      // Submit form data to backend
      const formResponse = await fetch('http://localhost:5000/hrpage/hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authenticate: formData.authenticate,
          techStack: formData.role,
          experience: formData.experience,
          numberOfQuestions: formData.numQuestions,
          questions: questionsPayload,
        }),
      });

      if (!formResponse.ok) {
        const errorData = await formResponse.json();
        throw new Error(errorData.message || 'Failed to create form');
      }

      const formDataResponse = await formResponse.json();

      if (formDataResponse.success) {
        // Assume the backend sends back the form data including a formID
        const formId = formDataResponse.data.formID;

        // Fetch matching candidates
        const usersResponse = await fetch('http://localhost:5000/work/workRole/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workerRole: formData.role,
            experience: formData.experience,
          }),
        });

        if (!usersResponse.ok) {
          const errorData = await usersResponse.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }

        const usersData = await usersResponse.json();

        if (usersData.success) {
          const candidates = usersData.data;
          setUsers(candidates);

          // For each candidate, generate a password from their name (or fallback to their authenticate value)
          // then send an email using EmailJS.
          candidates.forEach((candidate) => {
            const candidateNameStr = candidate.name ? candidate.name : candidate.authenticate;
            const candidatePassword = generatePasswordFromName(candidateNameStr);
            const candidateNameDisplay = `${candidate.authenticate}-${formId}`;
            const templateParams = {
              to_email: candidate.authenticate,
              candidate_name: candidateNameDisplay,
              candidate_password: candidatePassword
            };

            emailjs
              .send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)
              .then(
                (response) => {
                  console.log('Email sent successfully to:', candidate.authenticate, response.status, response.text);
                },
                (err) => {
                  console.error('Failed to send email to:', candidate.authenticate, err);
                }
              );
          });

          // Reset form after 3 seconds, keeping authenticate
          setTimeout(() => {
            setFormData({
              role: '',
              experience: '',
              numQuestions: 0,
              questions: [],
              authenticate: formData.authenticate,
            });
            setSubmitted(false);
          }, 3000);
        }
      }
    } catch (error) {
      setError(error.message);
      console.error('Submission error:', error);
      setSubmitted(false);
    }
  };

  return (
    <div className="hrInterview-page-wrapper">
      <HeaderHr />

      <div className="hrInterview-container">
        <div className="hrInterview-form-wrapper">
          <form onSubmit={handleSubmit}>
            {/* Position Details */}
            <div className="hrInterview-form-section">
              <h2>Position Details</h2>
              <div className="hrInterview-form-row">
                <div className="hrInterview-form-group">
                  <label htmlFor="role">Candidate Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="hrInterview-select"
                  >
                    <option value="">Select Role</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                  </select>
                </div>

                <div className="hrInterview-form-group">
                  <label htmlFor="experience">Experience Level</label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="hrInterview-select"
                  >
                    <option value="">Select Experience</option>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="4">4 Years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interview Questions */}
            <div className="hrInterview-form-section">
              <h2>Interview Questions</h2>
              <div className="hrInterview-form-group">
                <label htmlFor="numQuestions">Number of Questions</label>
                <select
                  id="numQuestions"
                  name="numQuestions"
                  value={formData.numQuestions}
                  onChange={handleChange}
                  required
                  className="hrInterview-select"
                >
                  <option value="0">Select Number</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {formData.questions.map((question, index) => (
                <div key={index} className="hrInterview-form-group hrInterview-full-width">
                  <label htmlFor={`question-${index}`}>Question {index + 1}</label>
                  <textarea
                    id={`question-${index}`}
                    value={question}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    required
                    className="hrInterview-textarea"
                    placeholder={`Enter question ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="hrInterview-form-actions">
              <button type="submit" className="hrInterview-submit-button">
                Submit
              </button>

              {submitted && !error && (
                <div className="hrInterview-success-message">
                  Form submitted successfully! Fetching matching candidates...
                </div>
              )}

              {error && <div className="hrInterview-error-message">{error}</div>}
            </div>

            {/* Display Matching Candidates */}
            {users.length > 0 && (
              <div className="hrInterview-users-section">
                <h2>Matching Candidates ({users.length})</h2>
                {users.map((candidate, index) => (
                  <div key={index} className="hrInterview-user-card">
                    <p>Profile: {candidate.authenticate}</p>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HRInterview;
