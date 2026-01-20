import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Sparkles, ThumbsUp, ThumbsDown, MessageSquare, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTED_PROMPTS = [
  "How does my offer compare?",
  "Prep me for my Google interview",
  "Should I take equity over salary?",
  "Help me negotiate my offer",
  "What should I expect in a consulting interview?",
  "Is my salary competitive for a PM role?"
];

export default function AICareerAdvisor({ onMentorConnect }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMentor, setSuggestedMentor] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: messageText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSuggestedMentor(null);

    try {
      const response = await base44.functions.invoke('aiCareerAdvisor', {
        message: messageText
      });

      if (response.data?.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (response.data.suggested_mentor) {
          setSuggestedMentor(response.data.suggested_mentor);
        }
      } else {
        throw new Error(response.data?.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('AI Advisor error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleFeedback = async (isHelpful) => {
    // Track feedback - could save to conversation entity
    console.log('Feedback:', isHelpful ? 'helpful' : 'not helpful');
  };

  const handleMentorConnect = (mentor) => {
    if (onMentorConnect) {
      onMentorConnect(mentor);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0021A5] to-[#0033CC] p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">AI Career Advisor</h2>
            <p className="text-white/70 text-sm">Powered by real data from the UF network</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Ask me anything about your career
            </h3>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Get personalized advice on salaries, interviews, negotiations, and career decisions — powered by real data from the UF network.
            </p>
            
            {/* Suggested Prompts */}
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-[#0021A5] text-white' 
                      : msg.isError 
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-slate-100 text-slate-800'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-slate">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  
                  {/* Feedback buttons for assistant messages */}
                  {msg.role === 'assistant' && !msg.isError && i === messages.length - 1 && (
                    <div className="flex items-center gap-2 mt-2 ml-2">
                      <span className="text-xs text-slate-400">Was this helpful?</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleFeedback(true)}
                      >
                        <ThumbsUp className="w-3 h-3 text-slate-400 hover:text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleFeedback(false)}
                      >
                        <ThumbsDown className="w-3 h-3 text-slate-400 hover:text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-[#FA4616] rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-slate-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggested Mentor Card */}
        {suggestedMentor && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-11"
          >
            <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <p className="text-sm text-slate-600 mb-3">
                💡 Based on your question, I think this person could help:
              </p>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold">
                  {suggestedMentor.name?.charAt(0) || 'M'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{suggestedMentor.name}</p>
                  <p className="text-sm text-slate-600">{suggestedMentor.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{suggestedMentor.reason}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  className="bg-[#FA4616] hover:bg-orange-600"
                  onClick={() => handleMentorConnect(suggestedMentor)}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Message {suggestedMentor.name?.split(' ')[0]}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSuggestedMentor(null)}
                >
                  Maybe Later
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about salaries, interviews, or your career..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button 
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-[#0021A5] hover:bg-[#001878] px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          AI advice based on aggregated, anonymous data. Not financial or legal advice.
        </p>
      </div>
    </div>
  );
}