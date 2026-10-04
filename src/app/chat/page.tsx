'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  ShieldCheck,
  AlertTriangle,
  History,
  Trash2,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { AskResponse } from '@/lib/types';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface DetectedLocation {
  buildingId: string;
  buildingName: string;
  roomId?: string;
  roomName?: string;
  floor?: string;
}

function detectCampusLocation(text: string): DetectedLocation | null {
  const lower = text.toLowerCase();
  if (lower.includes('hall 5') || lower.includes('hall-5')) {
    return { buildingId: 'chintan', buildingName: 'Chintan Bhawan (Bodhi Griha 3)', roomId: 'hall-5', roomName: 'Hall 5', floor: 'Floor 1, East Wing' };
  }
  if (lower.includes('hall 1') || lower.includes('hall-1')) {
    return { buildingId: 'chintan', buildingName: 'Chintan Bhawan (Bodhi Griha 3)', roomId: 'hall-1', roomName: 'Hall 1 (Auditorium)', floor: 'Ground Floor' };
  }
  if (lower.includes('bodhi griha') || lower.includes('chintan') || lower.includes('lecture hall')) {
    return { buildingId: 'chintan', buildingName: 'Chintan Bhawan (Bodhi Griha 3)' };
  }
  if (lower.includes('admissions') || lower.includes('g-12') || lower.includes('g12')) {
    return { buildingId: 'samadhan', buildingName: 'Samadhan Admin Block', roomId: 'admissions-g12', roomName: 'Admissions Office (G-12)', floor: 'Ground Floor' };
  }
  if (lower.includes('accounts') || lower.includes('room 108') || lower.includes('finance')) {
    return { buildingId: 'samadhan', buildingName: 'Samadhan Admin Block', roomId: 'finance-108', roomName: 'Finance & Accounts (Room 108)', floor: 'Floor 1' };
  }
  if (lower.includes('samadhan') || lower.includes('admin block') || lower.includes('director')) {
    return { buildingId: 'samadhan', buildingName: 'Samadhan Admin Block' };
  }
  if (lower.includes('library') || lower.includes('gyanodaya') || lower.includes('bloomberg')) {
    return { buildingId: 'gyanodaya', buildingName: 'Gyanodaya Central Library' };
  }
  if (lower.includes('bake-o-mocha') || lower.includes('coffee') || lower.includes('bom')) {
    return { buildingId: 'bake-o-mocha', buildingName: 'Bake-o-Mocha Cafe' };
  }
  if (lower.includes('mess') || lower.includes('annapoorna') || lower.includes('dining')) {
    return { buildingId: 'annapoorna-mess', buildingName: 'Annapoorna Mess' };
  }
  if (lower.includes('health centre') || lower.includes('samarpan') || lower.includes('medical') || lower.includes('doctor') || lower.includes('hospital')) {
    return { buildingId: 'health-centre', buildingName: 'Samarpan Health Centre' };
  }
  if (lower.includes('hostel 10') || lower.includes('h10')) {
    return { buildingId: 'hostel-10', buildingName: 'Hostel 10' };
  }
  if (lower.includes('hostel 13') || lower.includes('hostel 14') || lower.includes('h13') || lower.includes('h14')) {
    return { buildingId: 'hostel-13-14', buildingName: 'Hostels 13 & 14' };
  }
  if (lower.includes('hostel 16') || lower.includes('h16')) {
    return { buildingId: 'hostel-16', buildingName: 'Hostel 16' };
  }
  if (lower.includes('aryabhatt') || lower.includes('mdc') || lower.includes('guest house')) {
    return { buildingId: 'aryabhatt', buildingName: 'Aryabhatt Guest House (MDC)' };
  }
  if (lower.includes('patanjali') || lower.includes('faculty block')) {
    return { buildingId: 'patanjali', buildingName: 'Patanjali Faculty Block' };
  }
  if (lower.includes('anusandhan') || lower.includes('scifi') || lower.includes('incubator')) {
    return { buildingId: 'anusandhan', buildingName: 'Anusandhan SCIFI Incubation' };
  }
  if (lower.includes('auditorium') || lower.includes('utsav') || lower.includes('oat')) {
    return { buildingId: 'utsav-auditorium', buildingName: 'Utsav Auditorium & OAT' };
  }
  return null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responseMeta?: AskResponse;
  timestamp: string;
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState('student.pgp39@iiml.ac.in');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const demoChips = [
    { label: 'Hall 5 & 8:45 AM lecture', query: 'Where is Hall 5 and how do I reach it for my 8:45 AM lecture?' },
    { label: 'Fee instalments', query: 'Can I pay my tuition and hostel fees in instalments?' },
    { label: 'Mess timings & late food', query: 'What are the timings for Annapoorna Mess and where can we eat at 2 AM?' },
    { label: 'Reporting documents', query: 'Which certificates are mandatory at the time of physical reporting?' },
    { label: 'Hostel coolers & AC', query: 'What electrical appliances are permitted in hostel rooms?' },
    { label: 'Health centre doctor', query: 'Where is the Samarpan Health Centre and what emergency facilities are available?' },
  ];

  useEffect(() => {
    const savedEmail = localStorage.getItem('campussaarthi_email') || 'student.pgp39@iiml.ac.in';
    setUserEmail(savedEmail);

    const initialGreeting: ChatMessage = {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Welcome to CampusSaarthi. I answer questions about academic schedules, document reporting, fees, hostels, and campus navigation grounded in official IIM Lucknow circulars.\n\nWhat would you like to know?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const savedHistory = localStorage.getItem('campussaarthi_recents');
    if (savedHistory) {
      try {
        setRecentQuestions(JSON.parse(savedHistory));
      } catch (e) {
        setRecentQuestions([
          'Can I pay my tuition and hostel fees in instalments?',
          'Where is Hall 5 and how do I reach it for my 8:45 AM lecture?',
        ]);
      }
    } else {
      setRecentQuestions([
        'Can I pay my tuition and hostel fees in instalments?',
        'Where is Hall 5 and how do I reach it for my 8:45 AM lecture?',
      ]);
    }

    setMessages([initialGreeting]);

    if (initialQuery) {
      setTimeout(() => {
        handleAsk(initialQuery);
      }, 300);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const trimmed = questionText.trim();
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const updatedHistory = [trimmed, ...recentQuestions.filter((q) => q !== trimmed)].slice(0, 10);
    setRecentQuestions(updatedHistory);
    localStorage.setItem('campussaarthi_recents', JSON.stringify(updatedHistory));

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          user_email: userEmail,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: AskResponse = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        responseMeta: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorBotMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'An error occurred while retrieving official records. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorBotMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const resetGreeting: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Chat cleared. What question can I help you with?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([resetGreeting]);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-3.5rem)] overflow-hidden bg-[#FAFAF8] text-[#1A1A1A]">
      {/* Side Panel: Recent Inquiries */}
      <aside className="w-full md:w-72 bg-white border-r border-[#ECECEC] flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[#ECECEC] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#1A1A1A]">Recent questions</span>
          <button
            onClick={handleClearChat}
            className="text-[#5A5A5A] hover:text-[#1A1A1A] p-1 rounded hover:bg-[#FAFAF8] transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {recentQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="w-full text-left p-2.5 rounded-[8px] hover:bg-[#FAFAF8] text-xs text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors flex items-start space-x-2"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#5A5A5A] mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2 leading-relaxed">{q}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Feed */}
      <section className="flex-1 flex flex-col h-full bg-white overflow-hidden">
        {/* Chips */}
        <div className="bg-[#FAFAF8] border-b border-[#ECECEC] px-4 py-2.5 flex items-center space-x-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-medium text-[#5A5A5A] whitespace-nowrap">
            Suggested:
          </span>
          {demoChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(chip.query)}
              className="bg-white hover:bg-[#F5F5F3] border border-[#ECECEC] text-[#1A1A1A] px-3 py-1 rounded-[6px] whitespace-nowrap text-xs transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const meta = msg.responseMeta;
            const isEscalated = meta?.escalate;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-2xl ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {isUser ? (
                  /* User message in soft maroon-tinted bubble */
                  <div className="bg-[#F7EEF0] text-[#1A1A1A] px-4 py-3 rounded-[10px] text-xs sm:text-sm font-normal max-w-lg leading-relaxed">
                    {msg.text}
                  </div>
                ) : isEscalated ? (
                  /* Escalation card: Soft warning */
                  <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-[10px] p-4 text-xs sm:text-sm space-y-2 text-[#C2410C] w-full">
                    <div className="flex items-center space-x-2 font-semibold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Routed to Admin Cell</span>
                    </div>
                    <p className="text-xs text-[#1A1A1A] leading-relaxed">
                      This inquiry requires personal staff verification. An administrative ticket has been generated and dispatched to the Admin Cell.
                    </p>
                    <div className="pt-2 border-t border-[#FDBA74]/40 flex items-center justify-between text-[11px] text-[#C2410C]">
                      <span>Ticket: {meta?.escalation_id || 'ESC-AUTO-01'}</span>
                      <span>Confidence below 60% threshold</span>
                    </div>
                  </div>
                ) : (
                  /* Assistant message: White card with 1px border */
                  <div className="bg-white border border-[#ECECEC] rounded-[10px] p-4 sm:p-5 space-y-3 w-full shadow-xs">
                    {meta && (
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#ECECEC] text-xs">
                        <span className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-[#2E7D53] bg-[#2E7D53]/5 border border-[#2E7D53]/25 px-2.5 py-0.5 rounded-[6px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Grounded in {meta.used_source || 'Official circular'}</span>
                        </span>
                        <span className="text-[11px] text-[#5A5A5A]">
                          {meta.served_from_cache ? 'Cached' : `${Math.round(meta.confidence * 100)}% confidence`}
                        </span>
                      </div>
                    )}

                    <div className="text-xs sm:text-sm text-[#1A1A1A]">
                      <MarkdownRenderer content={msg.text} />
                    </div>

                    {/* Interactive Walk Route Card if Campus Location is Mentioned */}
                    {(() => {
                      const detectedLoc = detectCampusLocation(msg.text);
                      if (!detectedLoc) return null;
                      return (
                        <div className="bg-[#FAFAF8] border border-[#ECECEC] rounded-[8px] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-[6px] bg-[#6E1423]/10 flex items-center justify-center text-[#6E1423] flex-shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-[#1A1A1A]">
                                {detectedLoc.roomName ? detectedLoc.roomName : detectedLoc.buildingName}
                              </div>
                              <div className="text-[11px] text-[#5A5A5A]">
                                {detectedLoc.floor ? `${detectedLoc.floor} • ` : ''}{detectedLoc.buildingName}
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/navigator?destination=${detectedLoc.buildingId}${detectedLoc.roomId ? `&room=${detectedLoc.roomId}` : ''}`}
                            className="inline-flex items-center space-x-1.5 bg-[#6E1423] text-white hover:bg-[#58101C] text-xs font-medium px-3 py-1.5 rounded-[6px] transition-colors whitespace-nowrap"
                          >
                            <span>Walk Route on Map</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      );
                    })()}

                    {meta && (
                      <div className="pt-2 border-t border-[#ECECEC] flex items-center justify-between text-[11px] text-[#5A5A5A]">
                        <span>Model: {meta.model_used}</span>
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.text)}
                          className="hover:text-[#1A1A1A] p-1 transition-colors"
                          title="Copy answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-[#2E7D53]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-[#8A8A8A] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {isLoading && (
            <div className="bg-white border border-[#ECECEC] rounded-[10px] p-3 text-xs text-[#5A5A5A] flex items-center space-x-2 w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#6E1423]" />
              <span>Retrieving grounded answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#ECECEC] bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(inputText);
            }}
            className="max-w-3xl mx-auto flex items-end space-x-2"
          >
            <div className="flex-1 bg-white border border-[#ECECEC] rounded-[10px] focus-within:ring-2 focus-within:ring-[#6E1423]/20 focus-within:border-[#6E1423] transition-all">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk(inputText);
                  }
                }}
                placeholder="Ask about admissions, fee instalments, hostel rules, or navigation..."
                rows={1}
                className="w-full px-3.5 py-3 bg-transparent text-xs sm:text-sm outline-none resize-none max-h-32 text-[#1A1A1A]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="btn-primary disabled:opacity-50 flex items-center justify-center p-3"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-white text-[#5A5A5A]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#6E1423]" />
        </div>
      }
    >
      <ChatPageContent />
    </React.Suspense>
  );
}
