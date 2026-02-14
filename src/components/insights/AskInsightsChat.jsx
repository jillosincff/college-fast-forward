import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  "What's the average internship salary at UF for tech?",
  "Which companies hire the most Gators?",
  "What are the most common interview questions for consulting?",
  "What industries do UF students ask about most?",
];

export default function AskInsightsChat({ statsContext }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async (q) => {
    const question = q || query;
    if (!question.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setQuery('');
    setLoading(true);

    try {
      const contextPrompt = `You are CFF Insights, an AI assistant for the College Fast Forward Gator network at the University of Florida.
You help students, parents, and alumni understand career trends, salary data, and interview insights based on real UF community data.

Here is the current UF network context:
${statsContext || 'The UF Gator network has 900+ members including students, parents, and alumni.'}

Answer the following question helpfully, citing data when possible. If you don't have specific data, say so honestly and provide general guidance.
Keep answers concise (2-4 paragraphs max). Use markdown formatting.

Question: ${question}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: true,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that question right now. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-100 shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Ask CFF Insights
        </h2>
        <p className="text-sm text-white/70">AI-powered answers from UF network data</p>
      </div>
      <CardContent className="p-0">
        {messages.length === 0 && (
          <div className="p-5">
            <p className="text-sm text-slate-500 mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => askQuestion(q)}
                  className="text-xs sm:text-xs bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-left min-h-[40px]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#0021A5] text-white'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <ReactMarkdown className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t p-3 sm:p-4 flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about salaries, companies..."
            onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
            disabled={loading}
            className="flex-1 min-w-0"
          />
          <Button
            onClick={() => askQuestion()}
            disabled={!query.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0 w-11 sm:w-auto px-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}