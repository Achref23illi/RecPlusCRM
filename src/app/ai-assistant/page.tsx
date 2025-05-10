// src/app/ai-assistant/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Badge from '@/components/ui/Badge';

// Mock AI responses (in a real app, these would come from an API)
const mockResponses: Record<string, string> = {
  'email_template': 'Dear [Candidate Name],\n\nThank you for applying to the [Position] role at [Company]. We were impressed by your background and would like to invite you for an interview on [Date] at [Time].\n\nPlease let us know if this works for you, and we can provide further details about the interview process.\n\nBest regards,\n[Your Name]\nRecruiter at RecrutementPlus',
  'interview_questions': '1. Can you tell me about your previous experience with similar projects?\n2. How do you handle tight deadlines and competing priorities?\n3. Describe a challenging situation you faced at work and how you resolved it.\n4. What are your strengths and areas for improvement in relation to this role?\n5. Why are you interested in working with our client company?',
  'job_description': 'Job Title: Frontend Developer\n\nAbout the Company:\n[Company] is a leading technology firm specializing in innovative digital solutions for enterprise clients. We are seeking a talented Frontend Developer to join our growing team.\n\nResponsibilities:\n- Develop and maintain responsive web applications\n- Collaborate with designers and backend developers\n- Optimize applications for maximum speed and scalability\n- Ensure cross-browser compatibility and responsive design\n\nRequirements:\n- 3+ years experience with HTML, CSS, and JavaScript\n- Proficiency in React.js or similar frontend frameworks\n- Experience with responsive design and cross-browser compatibility\n- Strong problem-solving skills and attention to detail\n\nBenefits:\n- Competitive salary\n- Flexible working hours\n- Professional development opportunities\n- Collaborative and innovative work environment',
  'feedback_summary': 'Candidate Name: John Smith\nPosition: Project Manager\n\nStrengths:\n- Excellent communication skills\n- Strong experience leading cross-functional teams\n- Demonstrated ability to deliver projects on time and within budget\n\nAreas for Improvement:\n- Technical knowledge could be stronger in some areas\n- May benefit from more experience with agile methodologies\n\nOverall Assessment:\n4/5 - Strong candidate with great potential. Recommended for second interview.',
};

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

const AiAssistantPage = () => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you with writing emails, generating interview questions, creating job descriptions, and more. How can I assist you today?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    // Simulate AI response with a delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Replace loading message with actual response
      setMessages(prev => {
        const updatedMessages = [...prev];
        const loadingIndex = updatedMessages.findIndex(msg => msg.isLoading);
        
        if (loadingIndex !== -1) {
          // Generate AI response based on user input
          let responseContent = 'I understand you need help with that. Could you provide more specific information about what you need?';
          
          // Check for keywords in the user's message
          const lowerInput = input.toLowerCase();
          if (lowerInput.includes('email') || lowerInput.includes('message')) {
            responseContent = mockResponses.email_template;
          } else if (lowerInput.includes('interview') && lowerInput.includes('question')) {
            responseContent = mockResponses.interview_questions;
          } else if (lowerInput.includes('job') && (lowerInput.includes('description') || lowerInput.includes('posting'))) {
            responseContent = mockResponses.job_description;
          } else if (lowerInput.includes('feedback') || lowerInput.includes('candidate') || lowerInput.includes('summary')) {
            responseContent = mockResponses.feedback_summary;
          }
          
          updatedMessages[loadingIndex] = {
            id: Date.now().toString(),
            content: responseContent,
            sender: 'assistant',
            timestamp: new Date(),
          };
        }
        
        return updatedMessages;
      });
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          AI Assistant
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-13rem)] flex flex-col">
            <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      style={
                        message.sender === 'user'
                          ? {}
                          : { backgroundColor: `${colors.primary}20`, color: colors.text }
                      }
                    >
                      {message.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line">{message.content}</div>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : ''
                        }`}
                        style={{ color: message.sender === 'user' ? '' : `${colors.text}99` }}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="border-t p-4" style={{ borderColor: colors.border }}>
              <div className="flex space-x-2">
                <TextArea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  rows={2}
                  fullWidth
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  variant="primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card title="Quick Actions">
            <div className="space-y-2">
              <Button
                fullWidth
                variant="outline"
                onClick={() => setInput('Write an email template for inviting a candidate to an interview.')}
              >
                Email Template
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => setInput('Generate interview questions for a frontend developer position.')}
              >
                Interview Questions
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => setInput('Create a job description for a project manager role.')}
              >
                Job Description
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => setInput('Write a candidate feedback summary template.')}
              >
                Feedback Template
              </Button>
            </div>
          </Card>
          
          <Card title="AI Capabilities" className="mt-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.primary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Email Templates</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.primary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Interview Questions</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.primary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Job Descriptions</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.primary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>CV Analysis</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.primary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Feedback Summaries</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;