import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useUser } from '@clerk/clerk-react';

import {
  ChevronLeft,
  Mic,
  X,
  Save,
  MessageSquare,
  Volume2,
  VolumeX,
} from 'lucide-react';
import './Interview.css';

// Initialize the Generative AI client (make sure you keep your key private in production!)
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Dropdown data
const jobPositions = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Data Scientist',
];
const techStacks = [
  'React, MySQL',
  'Angular, PostgreSQL',
  'Vue, MongoDB',
  'Node.js, GraphQL',
  'Python, TensorFlow',
];
const experiences = ['1 year', '2 years', '3 years', '5 years', '7+ years'];

export default function Interview() {
  const { user } = useUser();

  const [formData, setFormData] = useState({
    jobPosition: '',
    jobDescription: '',
    techStack: '',
    experience: '',
    name: '',
    numOfQuestions: 5,
  });

  // Interview states
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState(3);

  // UI states
  const [showMediaPrompt, setShowMediaPrompt] = useState(false);
  const [mediaAllowed, setMediaAllowed] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailedFeedback, setDetailedFeedback] = useState({
    overall: '',
    questionFeedbacks: [],
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // References
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const formRef = useRef(null);

  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Start camera
  const startCamera = () => {
    if (
      showInterview &&
      mediaAllowed &&
      navigator.mediaDevices?.getUserMedia &&
      !videoRef.current?.srcObject
    ) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error('Error starting webcam:', err);
          alert('Unable to start webcam. Please ensure permission is granted.');
        });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (showInterview && mediaAllowed && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error('Error accessing media:', err);
          alert('Unable to access media. Please ensure permission is granted.');
        });
    }
    return () => {
      stopCamera();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [showInterview, mediaAllowed]);

  // Text-to-speech for questions
  useEffect(() => {
    if (showInterview && currentQuestion) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.rate = 1;
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [showInterview, currentQuestion]);

  useEffect(() => {
    if (!showInterview) {
      window.speechSynthesis.cancel();
    }
  }, [showInterview]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMaxQuestions(parseInt(formData.numOfQuestions, 10) || 5);

    try {
      // Reset states
      setQuestionCount(0);
      setDifficulty(3);
      setCurrentAnswer('');
      setCurrentQuestion('');
      setQuestions([]);
      setAnswers([]);
      setDetailedFeedback({ overall: '', questionFeedbacks: [] });
      setIsRecording(false);

      const prompt = `
        You are an AI that generates a single interview question about:
        - Job Position: ${formData.jobPosition}
        - Job Description: ${formData.jobDescription}
        - Tech Stack: ${formData.techStack}
        - Experience: ${formData.experience}
        Use a difficulty level of ${difficulty} (1 = easiest, 10 = hardest).
        Return only the question, no extra text and question must be equal to 4 lines.
      `;
      const result = await model.generateContent(prompt);
      const firstQuestion = result.response.text().trim();
      setQuestions([firstQuestion]);
      setCurrentQuestion(firstQuestion);
      setQuestionCount(1);
      setShowMediaPrompt(true);
      setFormVisible(false);
    } catch (error) {
      console.error('Error generating first question:', error);
      alert('Could not generate the first question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChoice = (choice) => {
    setShowMediaPrompt(false);
    setMediaAllowed(choice === 'allow');
    setShowInterview(true);
    if (choice === 'allow') startCamera();
  };

  // Speech recognition
  const startRecording = (callback) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        'Your browser does not support speech recognition. Please use a modern browser.'
      );
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        if (recognitionRef.current) recognitionRef.current.stop();

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('Speech recognition result:', transcript);
          callback(transcript);
          updateActivity();
        };

        recognition.onnomatch = () => {
          console.log('No matching speech recognized.');
          setIsRecording(false);
        };

        recognition.onspeechend = () => {
          console.log('Speech ended, stopping recognition.');
          recognition.stop();
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            alert(`Speech recognition error: ${event.error}`);
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsRecording(false);
          recognitionRef.current = null;
        };

        recognition.start();
        recognitionRef.current = recognition;
      })
      .catch((err) => {
        console.error('Error accessing microphone for speech recognition:', err);
        alert(
          'Microphone access denied. Please grant permission and try again.'
        );
        setIsRecording(false);
      });
  };

  // Interview flow handlers
  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before moving on.');
      return;
    }

    if (questionCount >= maxQuestions) {
      alert('You have answered all questions! Interview complete.');
      return;
    }

    setLoading(true);

    try {
      // Save current answer
      setAnswers((prev) => [...prev, currentAnswer]);

      const prompt = `
        The current difficulty is ${difficulty}.
        Question: ${currentQuestion}
        User Answer: ${currentAnswer}
        Evaluate the answer from 1 to 5 (1=very poor, 5=excellent).
        If rating < 3, reduce difficulty by 1 (min 1).
        If rating > 3, increase difficulty by 1 (max 10).
        Then generate the next interview question for:
          - Job Position: ${formData.jobPosition}
          - Job Description: ${formData.jobDescription}
          - Tech Stack: ${formData.techStack}
          - Experience: ${formData.experience}
        Return in this format:
        Rating: <score>
        NextQuestion: <question text>
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const lines = responseText.split('\n').map((line) => line.trim());
      const ratingLine = lines.find((line) => line.startsWith('Rating:'));
      const nextQLine = lines.find((line) => line.startsWith('NextQuestion:'));

      if (!ratingLine || !nextQLine) {
        console.error('Unexpected AI response:', responseText);
        alert('AI did not return the expected format. Please try again.');
        setLoading(false);
        return;
      }

      const rating = parseInt(ratingLine.replace('Rating:', '').trim(), 10);
      const nextQuestion = nextQLine.replace('NextQuestion:', '').trim();

      let newDifficulty = difficulty;
      if (rating < 3) newDifficulty = Math.max(1, difficulty - 1);
      else if (rating > 3) newDifficulty = Math.min(10, difficulty + 1);

      setDifficulty(newDifficulty);
      setQuestions((prev) => [...prev, nextQuestion]);
      setCurrentQuestion(nextQuestion);
      setCurrentAnswer('');
      setQuestionCount((prev) => prev + 1);
      updateActivity();
    } catch (error) {
      console.error('Error generating next question:', error);
      alert('Error generating next question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetFeedback = async () => {
    if (questions.length === 0) {
      alert('No interview questions available for feedback.');
      return;
    }

    setLoading(true);

    try {
      let prompt =
        'Please provide overall feedback for the following interview conversation and also provide individual feedback for each question. ' +
        'Format your answer as follows:\n\n';
      prompt += 'Overall Feedback: <Your overall feedback here>\n\n';

      questions.forEach((q, index) => {
        const answer =
          answers[index] ||
          (index === questionCount ? currentAnswer : 'No answer provided');
        prompt += `Q${index + 1}: ${q}\nA${index + 1}: ${answer}\nQ${index + 1} Feedback: <Your feedback for question ${
          index + 1
        } here>\n\n`;
      });

      const result = await model.generateContent(prompt);
      const feedbackText = result.response.text().trim();
      const lines = feedbackText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');

      let overall = '';
      let questionFeedbacks = [];

      lines.forEach((line) => {
        if (line.startsWith('Overall Feedback:')) {
          overall = line.replace('Overall Feedback:', '').trim();
        } else if (line.match(/^Q\d+\s*Feedback:/)) {
          const feedbackPart = line.replace(/Q\d+\s*Feedback:/, '').trim();
          questionFeedbacks.push(feedbackPart);
        }
      });

      setDetailedFeedback({ overall, questionFeedbacks });
      setShowConfetti(true);

      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    } catch (error) {
      console.error('Error generating feedback:', error);
      alert('Error generating feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
  };

  const handleSaveFeedback = async () => {
    const newAnswers = questions.map((q, index) =>
      answers[index] ||
      (index === questionCount ? currentAnswer : 'No answer provided')
    );

    if (newAnswers.length !== questions.length) {
      alert('Mismatch between number of questions and answers.');
      return;
    }

    if (!detailedFeedback.overall) {
      alert('Please generate overall feedback before saving.');
      return;
    }

    setLoading(true);

    try {
      // Generate AI answers for each question
      const aiAnswers = await Promise.all(
        questions.map(async (q) => {
          const prompt = `Please provide a sample answer for the following interview question. Your answer should not exceed 5 lines:\n\n${q}`;
          const result = await model.generateContent(prompt);
          return result.response.text().trim();
        })
      );

      const feedbackData = {
        authenticate:
          user?.emailAddresses?.[0]?.emailAddress ||
          user?.phoneNumbers?.[0]?.phoneNumber ||
          '',
        name: formData.name,
        feedbackId: Date.now(),
        jobPosition: formData.jobPosition,
        techStack: formData.techStack,
        experience: formData.experience,
        jobDescription: formData.jobDescription,
        difficultyLevel: difficulty,
        questions: questions.length,
        questionAnswers: questions.map((q, index) => ({
          question: q,
          answer: newAnswers[index],
          answerbyAI: aiAnswers[index],
        })),
        overallFeedback: detailedFeedback.overall,
      };

      const response = await fetch('http://localhost:5000/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) throw new Error('Failed to save feedback');

      alert('Feedback saved successfully');
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('Error saving feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowInterview(false);
    setShowMediaPrompt(false);
    setFormVisible(true);
    setFormData({
      jobPosition: '',
      jobDescription: '',
      techStack: '',
      experience: '',
      name: '',
      numOfQuestions: 5,
    });
    setCurrentQuestion('');
    setCurrentAnswer('');
    setQuestions([]);
    setAnswers([]);
    setQuestionCount(0);
    setDifficulty(3);
    setDetailedFeedback({ overall: '', questionFeedbacks: [] });
    setIsRecording(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    stopCamera();
  };

  return (
    <div className="interview-container">
      {/* Header */}
      <div className="interview-header">
        <h1>
          Interview Simulator <span className="green-text">AI</span>
        </h1>
        {formVisible && (
          <p className="interview-subtitle">
            Practice your technical interview skills with adaptive AI
          </p>
        )}
      </div>

      {/* Form */}
      {formVisible && (
        <div className="interview-form-container" ref={formRef}>
          <a href="/user/dash" className="back-button" style={{textDecoration: 'none'}}>
            <ChevronLeft size={18} />
            <span>Dashboard</span>
          </a>

          <form onSubmit={handleSubmit} className="interview-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="jobPosition">Job Position</label>
                <select
                  id="jobPosition"
                  name="jobPosition"
                  value={formData.jobPosition}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Position</option>
                  {jobPositions.map((position, idx) => (
                    <option key={idx} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="techStack">Tech Stack</label>
                <select
                  id="techStack"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Tech Stack</option>
                  {techStacks.map((stack, idx) => (
                    <option key={idx} value={stack}>
                      {stack}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experience">Experience Level</label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Experience</option>
                  {experiences.map((exp, idx) => (
                    <option key={idx} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="numOfQuestions">Number of Questions</label>
                <select
                  id="numOfQuestions"
                  name="numOfQuestions"
                  value={formData.numOfQuestions}
                  onChange={handleChange}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="jobDescription">Job Description / Additional Context</label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                placeholder="Paste job description or provide additional context"
                rows={4}
                required
              />
            </div>

            <button type="submit" className="submit-button">
              <span>Start Interview</span>
            </button>
          </form>
        </div>
      )}

      {/* Media permission prompt */}
      {showMediaPrompt && (
        <div className="overlay media-prompt">
          <div className="modal-content">
            <h2>Enable Camera?</h2>
            <p>
              Would you like to allow video for a more realistic interview
              experience?
            </p>
            <div className="button-group">
              <button onClick={() => handleMediaChoice('allow')} className="primary-button">
                Allow Camera
              </button>
              <button onClick={() => handleMediaChoice('deny')} className="secondary-button">
                Continue Without Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="overlay loading">
          <div className="loader">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        </div>
      )}

      {/* Interview interface */}
      {showInterview && (
        <div className="overlay interview-session">
          <div className="interview-panel">
            <button className="close-button" onClick={handleClose}>
              <X size={20} />
            </button>

            <div className="interview-grid">
              {/* Left column - Question & Answer */}
              <div className="interview-qa">
                <div className="difficulty-indicator">
                  <span>Difficulty:</span>
                  <div className="difficulty-bar">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`difficulty-segment ${i < difficulty ? 'active' : ''}`}
                      ></div>
                    ))}
                  </div>
                  <span className="question-counter">
                    Question {questionCount} of {maxQuestions}
                  </span>
                </div>

                <div className="question-container">
                  <div className="question-box">
                    <h3>Question:</h3>
                    <p>{currentQuestion}</p>

                    <button
                      className={`speech-toggle ${isReading ? 'speaking' : ''}`}
                      onClick={
                        isReading
                          ? handleStopSpeaking
                          : () => {
                              window.speechSynthesis.cancel();
                              const utterance = new SpeechSynthesisUtterance(currentQuestion);
                              utterance.onstart = () => setIsReading(true);
                              utterance.onend = () => setIsReading(false);
                              window.speechSynthesis.speak(utterance);
                            }
                      }
                    >
                      {isReading ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  </div>

                  <div className="answer-box">
                    <h3>Your Answer:</h3>
                    <div className="textarea-container">
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => {
                          updateActivity();
                          setCurrentAnswer(e.target.value);
                        }}
                        onFocus={() => {
                          updateActivity();
                          if (!videoRef.current?.srcObject && mediaAllowed) {
                            startCamera();
                          }
                        }}
                        placeholder="Type your answer here or use voice input..."
                        rows={5}
                      />

                      <button
                        type="button"
                        className={`mic-button ${isRecording ? 'recording' : ''}`}
                        onClick={() =>
                          startRecording((transcript) =>
                            setCurrentAnswer((prev) =>
                              prev ? prev + ' ' + transcript : transcript
                            )
                          )
                        }
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        title={isRecording ? 'Stop recording' : 'Click to speak'}
                      >
                        <div>
                          <Mic size={24} color="white" />
                        </div>
                        {isRecording && <span className="recording-pulse"></span>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Video & AI Avatar */}
              <div className="interview-visual">
                {mediaAllowed ? (
                  <div className="video-container">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                    ></video>
                    <div className="video-overlay"></div>
                  </div>
                ) : (
                  <div className="avatar-placeholder">
                    <div className="avatar-circle">
                      <span>
                        {formData.name
                          ? formData.name.charAt(0).toUpperCase()
                          : 'U'}
                      </span>
                    </div>
                  </div>
                )}

                <div className={`ai-avatar ${isReading ? 'speaking' : ''}`}>
                  <div className="ai-avatar-inner">
                    <span className="ai-icon">🤖</span>
                    {isReading && (
                      <div className="sound-waves">
                        <div className="wave wave1"></div>
                        <div className="wave wave2"></div>
                        <div className="wave wave3"></div>
                      </div>
                    )}
                  </div>
                  <span className="ai-label">AI Interviewer</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="interview-actions">
              {questionCount < maxQuestions ? (
                <button className="action-button submit-answer" onClick={handleNextQuestion}>
                  <MessageSquare size={18} />
                  <span>Submit & Next Question</span>
                </button>
              ) : detailedFeedback.overall === '' ? (
                <button className="action-button get-feedback" onClick={handleGetFeedback}>
                  <MessageSquare size={18} />
                  <span>Get Feedback</span>
                </button>
              ) : (
                <button className="action-button save-feedback" onClick={handleSaveFeedback}>
                  <Save size={18} />
                  <span>Save Feedback</span>
                </button>
              )}
            </div>

            {/* Feedback section */}
            {detailedFeedback.overall && (
              <div className="feedback-container">
                <h2>Interview Feedback</h2>
                <div className="overall-feedback">
                  <h3>Overall Assessment</h3>
                  <p>{detailedFeedback.overall}</p>
                </div>

                <div className="question-feedback">
                  <h3>Question-by-Question Feedback</h3>
                  <div className="feedback-items">
                    {detailedFeedback.questionFeedbacks.map((fb, idx) => (
                      <div key={idx} className="feedback-item">
                        <h4>Question {idx + 1}</h4>
                        <p className="question-text">{questions[idx]}</p>
                        <div className="feedback-content">
                          <p>{fb}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confetti effect when feedback is generated */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                backgroundColor:
                  i % 5 === 0
                    ? '#00cc66'
                    : i % 5 === 1
                    ? '#ffffff'
                    : i % 5 === 2
                    ? '#333333'
                    : i % 5 === 3
                    ? '#00b359'
                    : '#121212',
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
