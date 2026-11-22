import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Send,
  Building,
  MapPin,
  ExternalLink,
  Trash2,
  ChevronRight,
  ArrowRight,
  Bot,
} from 'lucide-react'
import { Button, Badge } from '../components/ui'
import { CircularProgress } from '../components/CircularProgress'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

export interface JobCardData {
  id: number
  title: string
  company: string
  description?: string
  location: string
  work_mode: string
  experience_level: string
  skills?: string
  apply_url?: string
  match_score?: number | null
  matched_skills?: string[] | null
  missing_skills?: string[] | null
  reasons?: string[] | null
}

export interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  jobs?: JobCardData[]
  toolCallsCount?: number
  timestamp: string
}

const getCompanyAvatarGradient = (name: string): string => {
  const gradients = [
    'from-indigo-600 to-violet-500',
    'from-blue-600 to-cyan-500',
    'from-emerald-600 to-teal-500',
    'from-purple-600 to-pink-500',
    'from-amber-600 to-orange-500',
    'from-rose-600 to-pink-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % gradients.length
  return gradients[index]
}

const STARTER_PROMPTS = [
  'What jobs in the catalog best match my profile and skills?',
  'Find remote Python and FastAPI developer positions',
  'What skills am I missing for senior backend and DevOps roles?',
  'Show me high-match React and TypeScript engineering jobs',
]

export const AssistantPage: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()

  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    // Initial welcome message from assistant
    const userName = user?.email ? user.email.split('@')[0] : 'there'
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${userName}! I am your HireMind AI Career Advisor. I have direct access to our live job listings and can evaluate your skill match compatibility in real time using the Groq AI engine.\n\nAsk me to find specific opportunities, analyze skill gaps for a position, or recommend the best roles for your background!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]
  })

  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Build conversation history for API
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await api.assistant.chat({
        message: text,
        messages: conversationHistory,
      })

      const assistantMessage: ChatMessageItem = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        jobs: response.jobs,
        toolCallsCount: response.tool_calls_count,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      toast.error(err.message || 'Failed to communicate with assistant', 'Assistant Error')
      // Append friendly error bubble
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            "I encountered a momentary connection issue. You can still search for positions directly on the Search page or review your dashboard recommendations!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    const userName = user?.email ? user.email.split('@')[0] : 'there'
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat session refreshed. What career goals or job inquiries can I assist you with today, ${userName}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    toast.info('Conversation history cleared', 'Chat Cleared')
  }

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-soft text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                AI Career Advisor
              </h1>
              <Badge variant="primary" size="sm">
                Groq LLaMA 3.3
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive matching engine with autonomous search & skill gap analysis
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/20"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        {messages.map((message) => {
          const isUser = message.role === 'user'

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {isUser ? (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-soft">
                  {userInitial}
                </div>
              ) : (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-bold text-white shadow-soft">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              {/* Message Bubble + Clickable Job Cards */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Text Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="space-y-2 whitespace-pre-line">
                    {message.content}
                  </div>

                  <div
                    className={`mt-1.5 flex items-center justify-end text-[10px] space-x-2 ${
                      isUser ? 'text-indigo-200' : 'text-slate-500'
                    }`}
                  >
                    {message.toolCallsCount !== undefined && message.toolCallsCount > 0 && (
                      <span className="font-semibold text-indigo-400">
                        {message.toolCallsCount} tool {message.toolCallsCount === 1 ? 'call' : 'calls'}
                      </span>
                    )}
                    <span>{message.timestamp}</span>
                  </div>
                </div>

                {/* Clickable Job Cards Inside Reply */}
                {message.jobs && message.jobs.length > 0 && (
                  <div className="space-y-2.5 w-full pt-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Referenced Opportunities ({message.jobs.length})</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {message.jobs.map((job) => {
                        const companyInitial = job.company ? job.company.charAt(0).toUpperCase() : 'H'
                        const avatarGrad = getCompanyAvatarGradient(job.company || 'Company')

                        return (
                          <div
                            key={job.id}
                            className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 p-4 transition-all duration-200 shadow-md hover:shadow-indigo-500/5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start space-x-3 flex-1 min-w-0">
                                {/* Company Initial Avatar */}
                                <div
                                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${avatarGrad} text-sm font-black text-white shadow-soft`}
                                >
                                  {companyInitial}
                                </div>

                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                      to={`/jobs/${job.id}`}
                                      className="text-sm font-bold text-white hover:text-indigo-300 transition-colors tracking-tight flex items-center gap-1 group-hover:text-indigo-300"
                                    >
                                      <span>{job.title}</span>
                                      <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                    <Badge variant="default" size="sm">
                                      {job.work_mode}
                                    </Badge>
                                    <Badge variant="outline" size="sm">
                                      {job.experience_level}
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                    <span className="flex items-center space-x-1 text-slate-300 font-medium">
                                      <Building className="h-3 w-3 text-slate-500" />
                                      <span>{job.company}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <MapPin className="h-3 w-3 text-slate-500" />
                                      <span>{job.location}</span>
                                    </span>
                                  </div>

                                  {job.skills && (
                                    <div className="flex flex-wrap gap-1 pt-1.5">
                                      {job.skills.split(',').slice(0, 4).map((s, idx) => (
                                        <span
                                          key={idx}
                                          className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700/60"
                                        >
                                          {s.trim()}
                                        </span>
                                      ))}
                                      {job.skills.split(',').length > 4 && (
                                        <span className="text-[10px] text-slate-500 self-center">
                                          +{job.skills.split(',').length - 4} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right: Circular Match Ring + Actions */}
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                {job.match_score !== undefined && job.match_score !== null && (
                                  <CircularProgress score={job.match_score} size={42} />
                                )}

                                <div className="flex items-center space-x-1.5 pt-1">
                                  <Link to={`/jobs/${job.id}`}>
                                    <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                                      Details
                                    </Button>
                                  </Link>
                                  {job.apply_url && (
                                    <a
                                      href={job.apply_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button size="sm" className="h-7 px-2.5 text-xs" rightIcon={<ExternalLink className="h-3 w-3" />}>
                                        Apply
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-bold text-white shadow-soft">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 p-4 space-y-2 text-xs text-slate-400 shadow-sm max-w-[80%]">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-slate-300 font-semibold text-xs">HireMind AI is analyzing catalog & candidate match...</span>
              </div>
              <p className="text-[11px] text-slate-500">Executing search_jobs and evaluating candidate skill gaps via Groq API</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Suggestions & Input Bar */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3 flex-shrink-0">
        {/* Starter Prompts (visible when few messages exist) */}
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-1.5 pb-1">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSendMessage(prompt)}
                className="inline-flex items-center rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all text-left"
              >
                <span>{prompt}</span>
                <ArrowRight className="h-3 w-3 ml-1.5 text-indigo-400 opacity-70" />
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            disabled={loading}
            aria-label="Ask about jobs, skill gaps, or career fit"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about jobs, skill gaps, or career fit..."
            className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 px-4 py-3.5 pr-14 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner disabled:opacity-50"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-soft transition-all hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
          <span>Groq API tool-augmented career engine (max 3 tool calls per turn)</span>
          <Link to="/search" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Explore live catalog
          </Link>
        </div>
      </div>
    </div>
  )
}
