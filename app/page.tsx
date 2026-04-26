// 'use client'

// import { useState, useEffect, useCallback, useRef } from 'react'

// // ── Types ──
// interface Attachment {
//   id: string
//   has_preview: boolean
//   name: string
//   size: number
// }
// interface Message {
//   id: string
//   from: string
//   to: string
//   cc: string | null
//   subject: string
//   body_text: string
//   body_html: string
//   created_at: string
//   attachments: Attachment[]
// }

// // ── API Proxy ──
// const PROXY = '/api/external'

// async function generateEmail(): Promise<{ email: string; token: string }> {
//   const res = await fetch(`${PROXY}/email/new`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ min_name_length: 10, max_name_length: 10 }),
//   })
//   if (!res.ok) throw new Error('Failed to generate email')
//   const data = await res.json()
//   return { email: data.email, token: data.token || '' }
// }

// async function fetchMessages(email: string): Promise<Message[]> {
//   const res = await fetch(`${PROXY}/email/${email}/messages`)
//   if (!res.ok) throw new Error('Failed to fetch messages')
//   return res.json()
// }

// async function deleteMessage(messageId: string, token: string): Promise<void> {
//   const res = await fetch(`${PROXY}/message/${messageId}`, {
//     method: 'DELETE',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ token }),
//   })
//   if (!res.ok) throw new Error('Failed to delete message')
// }

// export default function Home() {
//   const [email, setEmail] = useState('')
//   const [token, setToken] = useState('')
//   const [messages, setMessages] = useState<Message[]>([])
//   const [selectedMsg, setSelectedMsg] = useState<Message | null>(null)
//   const [initialLoading, setInitialLoading] = useState(true)
//   const [refreshLoading, setRefreshLoading] = useState(false)
//   const [changeLoading, setChangeLoading] = useState(false)
//   const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null)
//   const [waitingForMail, setWaitingForMail] = useState(false)
//   const [toast, setToast] = useState('')
//   const emailRef = useRef<HTMLDivElement>(null)
//   const intervalRef = useRef<NodeJS.Timeout | null>(null)

//   const showToast = (msg: string) => {
//     setToast(msg)
//     setTimeout(() => setToast(''), 3000)
//   }

//   // ── Initialisation ──────────────────────────
//   const initEmail = useCallback(async () => {
//     setInitialLoading(true)
//     try {
//       const storedEmail = localStorage.getItem('tempMailEmail')
//       const storedToken = localStorage.getItem('tempMailToken')
//       let currentEmail = storedEmail ?? ''
//       let currentToken = storedToken ?? ''

//       if (!currentEmail) {
//         const newData = await generateEmail()
//         currentEmail = newData.email
//         currentToken = newData.token
//         localStorage.setItem('tempMailEmail', currentEmail)
//         localStorage.setItem('tempMailToken', currentToken)
//       }

//       setEmail(currentEmail)
//       setToken(currentToken)

//       const msgs = await fetchMessages(currentEmail)
//       setMessages(msgs)
//       if (msgs.length > 0) {
//         setSelectedMsg(msgs[0])
//         setWaitingForMail(false)
//       } else {
//         setSelectedMsg(null)
//         setWaitingForMail(true)
//       }
//     } catch (err: any) {
//       showToast(err.message || 'Error loading mailbox')
//     } finally {
//       setInitialLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     initEmail()
//   }, [initEmail])

//   // ── Auto‑polling ────────────────────────────
//   useEffect(() => {
//     if (!email) return
//     const poll = async () => {
//       try {
//         const msgs = await fetchMessages(email)
//         setMessages(msgs)
//         if (msgs.length > 0) {
//           setWaitingForMail(false)
//           if (!selectedMsg) setSelectedMsg(msgs[0])
//         } else {
//           setWaitingForMail(true)
//         }
//       } catch { /* silent */ }
//     }
//     intervalRef.current = setInterval(poll, 8000)
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current)
//     }
//   }, [email, selectedMsg])

//   // ── Change Email ───────────────────────────
//   const changeEmail = async () => {
//     setChangeLoading(true)
//     setSelectedMsg(null)
//     setMessages([])
//     setWaitingForMail(true)
//     try {
//       const newData = await generateEmail()
//       localStorage.setItem('tempMailEmail', newData.email)
//       localStorage.setItem('tempMailToken', newData.token)
//       setEmail(newData.email)
//       setToken(newData.token)

//       const msgs = await fetchMessages(newData.email)
//       setMessages(msgs)
//       if (msgs.length > 0) {
//         setSelectedMsg(msgs[0])
//         setWaitingForMail(false)
//       }
//       showToast('New email generated!')
//     } catch (err: any) {
//       showToast(err.message || 'Change failed')
//     } finally {
//       setChangeLoading(false)
//     }
//   }

//   // ── Refresh Inbox ──────────────────────────
//   const refreshInbox = async () => {
//     if (!email) return
//     setRefreshLoading(true)
//     try {
//       const msgs = await fetchMessages(email)
//       setMessages(msgs)
//       if (msgs.length > 0) {
//         setWaitingForMail(false)
//         if (!selectedMsg) setSelectedMsg(msgs[0])
//       } else {
//         setWaitingForMail(true)
//       }
//       showToast('Inbox refreshed')
//     } catch (err: any) {
//       showToast(err.message || 'Refresh failed')
//     } finally {
//       setRefreshLoading(false)
//     }
//   }

//   // ── Delete Message ─────────────────────────
//   const handleDeleteMessage = async (messageId: string) => {
//     if (!token) {
//       showToast('Missing token – try refreshing')
//       return
//     }
//     setDeletingMsgId(messageId)
//     try {
//       await deleteMessage(messageId, token)

//       const updated = messages.filter(m => m.id !== messageId)
//       setMessages(updated)

//       if (selectedMsg?.id === messageId) {
//         if (updated.length > 0) {
//           setSelectedMsg(updated[0])
//         } else {
//           setSelectedMsg(null)
//         }
//       }

//       showToast('Message deleted')
//     } catch (err: any) {
//       showToast(err.message || 'Delete failed')
//     } finally {
//       setDeletingMsgId(null)
//     }
//   }

//   // ── Copy Email ─────────────────────────────
//   const copyEmail = async () => {
//     if (!email) return
//     try {
//       await navigator.clipboard.writeText(email)
//       showToast('Email copied successfully!')
//     } catch {
//       const el = emailRef.current
//       if (el) {
//         const range = document.createRange()
//         range.selectNodeContents(el)
//         const sel = window.getSelection()
//         sel?.removeAllRanges()
//         sel?.addRange(range)
//         document.execCommand('copy')
//         sel?.removeAllRanges()
//         showToast('Email copied!')
//       }
//     }
//   }

//   // ── Preview Attachment ─────────────────────
//   const handlePreview = async (attId: string) => {
//     try {
//       const response = await fetch(`${PROXY}/attachment/${attId}`)
//       if (!response.ok) throw new Error('Failed to load attachment')
//       const blob = await response.blob()
//       const url = URL.createObjectURL(blob)
//       window.open(url, '_blank', 'noopener,noreferrer')
//     } catch (err: any) {
//       showToast('Preview failed: ' + (err.message || 'Unknown error'))
//     }
//   }

//   const formatTime = (iso: string) =>
//     new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

//   const downloadUrl = (attId: string) => `${PROXY}/attachment/${attId}?download=1`

//   return (
//     <>
//       {/* Header */}
//       <header className="header">
//         <div className="container header-inner">
//           <a href="#" className="logo">temp‑mailbox</a>
//           <nav className="nav">
//             <a href="#features">Features</a>
//             <a href="#how-it-works">How It Works</a>
//             <a href="#faq">FAQ</a>
//             <a href="#mailbox" className="mailbox-link">Mailbox</a>
//           </nav>
//         </div>
//       </header>

//       {toast && <div className="toast">{toast}</div>}

//       {/* Hero */}
//       <section className="hero">
//         <div className="hero-bg" />
//         <h1>Free Temporary Email Address in Seconds</h1>
//         <p>Protect your privacy. Avoid spam. Use disposable email instantly.</p>

//         <div className="hero-email-card">
//           <div className="hero-email-text" ref={emailRef}>{email || 'Generating...'}</div>
//           <button onClick={copyEmail} className="hero-copy-btn" title="Copy email">
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
//               <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
//             </svg>
//           </button>
//         </div>

//         <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
//           <button onClick={refreshInbox} disabled={refreshLoading} className="btn-filled">
//             {refreshLoading ? 'Refreshing...' : 'Refresh'}
//           </button>
//           <button onClick={changeEmail} disabled={changeLoading} className="btn-filled">
//             {changeLoading ? 'Changing...' : 'Change'}
//           </button>
//         </div>
//       </section>

//       {/* Mailbox Section */}
//       <section id="mailbox" className="container">
//         <div className="mailbox-grid glass">
//           {/* Inbox Panel */}
//           <div className="inbox-panel">
//             <div className="email-display">
//               <div className="email-text">{email}</div>
//               <button onClick={copyEmail} className="copy-btn" title="Copy email">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
//                   <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
//                 </svg>
//               </button>
//             </div>
//             <div className="inbox-actions" style={{ display: 'flex', gap: '0.75rem' }}>
//               <button onClick={refreshInbox} disabled={refreshLoading}>
//                 {refreshLoading ? 'Refreshing...' : 'Refresh'}
//               </button>
//             </div>
//             <div className="inbox-header">
//               <span>Inbox</span>
//               <span className="inbox-count">{messages.length}</span>
//             </div>
//             <div className="inbox-list">
//               {initialLoading ? (
//                 <p style={{ textAlign: 'center', color: 'var(--text-soft)', marginTop: '2rem' }}>Loading mailbox...</p>
//               ) : messages.length === 0 ? (
//                 <p style={{ textAlign: 'center', color: 'var(--text-soft)', marginTop: '2rem' }}>No messages yet</p>
//               ) : (
//                 messages.map(msg => (
//                   <div key={msg.id} className="inbox-card-wrapper">
//                     <button
//                       onClick={() => setSelectedMsg(msg)}
//                       className={`inbox-card ${selectedMsg?.id === msg.id ? 'active' : ''}`}
//                       style={{ paddingRight: '2.5rem' }}
//                     >
//                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <span className="inbox-from">
//                           {msg.from.replace(/<.*>/, '').replace(/"/g, '').trim() || 'Unknown'}
//                         </span>
//                         <span className="inbox-time">{formatTime(msg.created_at)}</span>
//                       </div>
//                       <p className="inbox-subject">{msg.subject || '(no subject)'}</p>
//                       <p className="inbox-preview">{msg.body_text?.slice(0, 50)}</p>
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         handleDeleteMessage(msg.id)
//                       }}
//                       disabled={deletingMsgId === msg.id}
//                       className="delete-msg-btn"
//                       title="Delete message"
//                     >
//                       {deletingMsgId === msg.id ? (
//                         <div className="loader-ring" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
//                       ) : (
//                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-start)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <polyline points="3 6 5 6 21 6"></polyline>
//                           <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
//                           <line x1="10" y1="11" x2="10" y2="17"></line>
//                           <line x1="14" y1="11" x2="14" y2="17"></line>
//                         </svg>
//                       )}
//                     </button>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Message Viewer */}
//           <div className="message-viewer">
//             {initialLoading ? (
//               <div className="message-loader">
//                 <div className="loader-ring" style={{ width: '48px', height: '48px', borderWidth: '4px' }} />
//                 <span>Loading messages...</span>
//               </div>
//             ) : !selectedMsg ? (
//               <div className="message-loader">
//                 <div className="loader-ring" style={{ width: '48px', height: '48px', borderWidth: '4px' }} />
//                 <span>Waiting for new emails...</span>
//               </div>
//             ) : (
//               <>
//                 <div className="message-header">
//                   <h3 className="message-subject">{selectedMsg.subject || '(no subject)'}</h3>
//                   <div className="message-meta">
//                     <span>From: <strong>{selectedMsg.from}</strong></span>
//                     <span>{new Date(selectedMsg.created_at).toLocaleString()}</span>
//                   </div>
//                   <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginTop: '0.25rem' }}>
//                     To: <span style={{ fontFamily: 'monospace' }}>{selectedMsg.to}</span>
//                   </div>
//                   <button
//                     onClick={() => handleDeleteMessage(selectedMsg.id)}
//                     disabled={deletingMsgId === selectedMsg.id}
//                     className="btn-sm btn-preview"
//                     style={{ marginTop: '0.75rem' }}
//                   >
//                     {deletingMsgId === selectedMsg.id ? 'Deleting...' : 'Delete message'}
//                   </button>
//                 </div>
//                 <div className="message-body">
//                   {selectedMsg.body_html ? (
//                     <div dangerouslySetInnerHTML={{ __html: selectedMsg.body_html }} />
//                   ) : (
//                     <pre style={{ whiteSpace: 'pre-wrap', fontWeight: 400 }}>{selectedMsg.body_text}</pre>
//                   )}
//                 </div>
//                 {selectedMsg.attachments && selectedMsg.attachments.length > 0 && (
//                   <div className="attachments">
//                     <h4 style={{ fontWeight: 400, marginBottom: '0.75rem' }}>
//                       📎 Attachments ({selectedMsg.attachments.length})
//                     </h4>
//                     <div className="attachment-grid">
//                       {selectedMsg.attachments.map(att => (
//                         <div key={att.id} className="attachment-card">
//                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-start)" strokeWidth="2">
//                               <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                             </svg>
//                             <span style={{ fontWeight: 400, fontSize: '0.8rem', wordBreak: 'break-all' }}>{att.name}</span>
//                           </div>
//                           <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>{(att.size / 1024).toFixed(1)} KB</span>
//                           <div className="attach-actions">
//                             <button onClick={() => handlePreview(att.id)} className="btn-sm btn-preview">
//                               Preview
//                             </button>
//                             <a href={downloadUrl(att.id)} className="btn-sm btn-download">
//                               Download
//                             </a>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* Features, Steps, FAQ, SEO, Footer – identical to previous versions */}
//       <section id="features" className="container">
//         <h2 style={{ textAlign: 'center', marginBottom: '2rem', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: 400 }}>
//           Why temp‑mailbox?
//         </h2>
//         <div className="features-grid">
//           {['Instant Email', 'Secure & Anonymous', 'Auto‑Refresh', 'Attachment Support'].map((title, i) => (
//             <div key={title} className="glass feature-card">
//               <h3>{title}</h3>
//               <p style={{ fontWeight: 400, color: 'var(--text-soft)' }}>
//                 {['One click, no registration.', 'No logs, full privacy.', 'Inbox updates in real time.', 'Preview and download files.'][i]}
//               </p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section id="how-it-works" className="container">
//         <h2 style={{ textAlign: 'center', marginBottom: '2rem', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: 400 }}>
//           How It Works
//         </h2>
//         <div className="steps">
//           {['Generate email', 'Use it anywhere', 'Receive messages', 'Delete or change'].map((step, i) => (
//             <div key={step} className="glass step-card">
//               <div className="step-number">{i + 1}</div>
//               <p>{step}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section id="faq" className="container">
//         <h2 style={{ textAlign: 'center', marginBottom: '2rem', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: 400 }}>
//           FAQ
//         </h2>
//         {[
//           { q: 'What is a temporary email?', a: 'A disposable address that expires, protecting your real inbox from spam.' },
//           { q: 'Is temp‑mailbox safe?', a: 'Yes, we do not store any personal data.' },
//           { q: 'How long do emails last?', a: 'Usually 1–2 hours, but you can change address anytime.' },
//           { q: 'Can I receive attachments?', a: 'Absolutely! Preview and download supported.' },
//         ].map(faq => (
//           <details key={faq.q} className="faq-item">
//             <summary className="faq-question">{faq.q}</summary>
//             <div className="faq-answer">{faq.a}</div>
//           </details>
//         ))}
//       </section>

//       <div className="container seo-block">
//         <h2 style={{ fontWeight: 400, marginBottom: '1rem' }}>Free Temporary Email Generator</h2>
//         <p>Looking for a temporary email, disposable email, or fake email generator? temp‑mailbox provides instant, secure, and anonymous temporary email addresses. Use our temp mail inbox for newsletters, verifications, and spam avoidance. No signup required. Trusted by thousands daily.</p>
//         <p style={{ marginTop: '1rem' }}>With real‑time auto‑refresh, attachment support, and a sleek interface, temp‑mailbox makes disposable email effortless. Stay safe and anonymous – try it now!</p>
//       </div>

//       <footer className="footer container">
//         <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
//           <a href="#">About</a>
//           <a href="#">Privacy Policy</a>
//           <a href="#">Terms of Service</a>
//           <a href="#">Contact</a>
//         </div>
//         <span>© {new Date().getFullYear()} temp‑mailbox. All rights reserved.</span>
//       </footer>
//     </>
//   )
// }


'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ── Types ──
interface Attachment {
  id: string
  has_preview: boolean
  name: string
  size: number
}
interface Message {
  id: string
  from: string
  to: string
  cc: string | null
  subject: string
  body_text: string
  body_html: string
  created_at: string
  attachments: Attachment[]
}

// ── API Proxy ──
const PROXY = '/api/external'

async function generateEmail(): Promise<{ email: string; token: string }> {
  const res = await fetch(`${PROXY}/email/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ min_name_length: 10, max_name_length: 10 }),
  })
  if (!res.ok) throw new Error('Failed to generate email')
  const data = await res.json()
  return { email: data.email, token: data.token || '' }
}

async function fetchMessages(email: string): Promise<Message[]> {
  const res = await fetch(`${PROXY}/email/${email}/messages`)
  if (!res.ok) throw new Error('Failed to fetch messages')
  return res.json()
}

async function deleteMessage(messageId: string, token: string): Promise<void> {
  const res = await fetch(`${PROXY}/message/${messageId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!res.ok) throw new Error('Failed to delete message')
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [changeLoading, setChangeLoading] = useState(false)
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null)
  const [waitingForMail, setWaitingForMail] = useState(false)
  const [toast, setToast] = useState('')
  const emailRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const adContainerRef = useRef<HTMLDivElement>(null)
  const adInitializedRef = useRef(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // ── Initialisation ──────────────────────────
  const initEmail = useCallback(async () => {
    setInitialLoading(true)
    try {
      const storedEmail = localStorage.getItem('tempMailEmail')
      const storedToken = localStorage.getItem('tempMailToken')
      let currentEmail = storedEmail ?? ''
      let currentToken = storedToken ?? ''

      if (!currentEmail) {
        const newData = await generateEmail()
        currentEmail = newData.email
        currentToken = newData.token
        localStorage.setItem('tempMailEmail', currentEmail)
        localStorage.setItem('tempMailToken', currentToken)
      }

      setEmail(currentEmail)
      setToken(currentToken)

      const msgs = await fetchMessages(currentEmail)
      setMessages(msgs)
      if (msgs.length > 0) {
        setSelectedMsg(msgs[0])
        setWaitingForMail(false)
      } else {
        setSelectedMsg(null)
        setWaitingForMail(true)
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading mailbox')
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    initEmail()
  }, [initEmail])

  // ── Auto‑polling ────────────────────────────
  useEffect(() => {
    if (!email) return
    const poll = async () => {
      try {
        const msgs = await fetchMessages(email)
        setMessages(msgs)
        if (msgs.length > 0) {
          setWaitingForMail(false)
          if (!selectedMsg) setSelectedMsg(msgs[0])
        } else {
          setWaitingForMail(true)
        }
      } catch { /* silent */ }
    }
    intervalRef.current = setInterval(poll, 8000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [email, selectedMsg])

  // ── Change Email ───────────────────────────
  const changeEmail = async () => {
    setChangeLoading(true)
    setSelectedMsg(null)
    setMessages([])
    setWaitingForMail(true)
    try {
      const newData = await generateEmail()
      localStorage.setItem('tempMailEmail', newData.email)
      localStorage.setItem('tempMailToken', newData.token)
      setEmail(newData.email)
      setToken(newData.token)

      const msgs = await fetchMessages(newData.email)
      setMessages(msgs)
      if (msgs.length > 0) {
        setSelectedMsg(msgs[0])
        setWaitingForMail(false)
      }
      showToast('New email generated!')
    } catch (err: any) {
      showToast(err.message || 'Change failed')
    } finally {
      setChangeLoading(false)
    }
  }

  // ── Refresh Inbox ──────────────────────────
  const refreshInbox = async () => {
    if (!email) return
    setRefreshLoading(true)
    try {
      const msgs = await fetchMessages(email)
      setMessages(msgs)
      if (msgs.length > 0) {
        setWaitingForMail(false)
        if (!selectedMsg) setSelectedMsg(msgs[0])
      } else {
        setWaitingForMail(true)
      }
      showToast('Inbox refreshed')
    } catch (err: any) {
      showToast(err.message || 'Refresh failed')
    } finally {
      setRefreshLoading(false)
    }
  }

  // ── Delete Message ─────────────────────────
  const handleDeleteMessage = async (messageId: string) => {
    if (!token) {
      showToast('Missing token – try refreshing')
      return
    }
    setDeletingMsgId(messageId)
    try {
      await deleteMessage(messageId, token)

      const updated = messages.filter(m => m.id !== messageId)
      setMessages(updated)

      if (selectedMsg?.id === messageId) {
        if (updated.length > 0) {
          setSelectedMsg(updated[0])
        } else {
          setSelectedMsg(null)
        }
      }

      showToast('Message deleted')
    } catch (err: any) {
      showToast(err.message || 'Delete failed')
    } finally {
      setDeletingMsgId(null)
    }
  }

  // ── Copy Email ─────────────────────────────
  const copyEmail = async () => {
    if (!email) return
    try {
      await navigator.clipboard.writeText(email)
      showToast('Email copied successfully!')
    } catch {
      const el = emailRef.current
      if (el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
        document.execCommand('copy')
        sel?.removeAllRanges()
        showToast('Email copied!')
      }
    }
  }

  // ── Preview Attachment ─────────────────────
  const handlePreview = async (attId: string) => {
    try {
      const response = await fetch(`${PROXY}/attachment/${attId}`)
      if (!response.ok) throw new Error('Failed to load attachment')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err: any) {
      showToast('Preview failed: ' + (err.message || 'Unknown error'))
    }
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const downloadUrl = (attId: string) => `${PROXY}/attachment/${attId}?download=1`

  // ── Inject Ad Scripts (only once) ───────────────
  useEffect(() => {
    if (adInitializedRef.current || !adContainerRef.current) return
    adInitializedRef.current = true

    // Clear any previous content inside the container
    adContainerRef.current.innerHTML = ''

    // Create script that defines atOptions (must be globally accessible)
    const configScript = document.createElement('script')
    configScript.textContent = `
      window.atOptions = {
        'key' : '74f55211bc95410d3dda39ea97e90829',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `

    // Create script that loads the ad network's invoke.js
    const invokeScript = document.createElement('script')
    invokeScript.src = 'https://www.highperformanceformat.com/74f55211bc95410d3dda39ea97e90829/invoke.js'
    invokeScript.async = true

    // Append both scripts in order
    adContainerRef.current.appendChild(configScript)
    adContainerRef.current.appendChild(invokeScript)

    // Cleanup on unmount (optional but good practice)
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = ''
      }
      adInitializedRef.current = false
    }
  }, [])

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <a href="#" className="logo">temp‑mailbox</a>
          <nav className="nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#faq">FAQ</a>
            <a href="#mailbox" className="mailbox-link">Mailbox</a>
          </nav>
        </div>
      </header>

      {toast && <div className="toast">{toast}</div>}

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <h1>Free Temporary Email Address in Seconds</h1>
        <p>Protect your privacy. Avoid spam. Use disposable email instantly.</p>

        <div className="hero-email-card">
          <div className="hero-email-text" ref={emailRef}>{email || 'Generating...'}</div>
          <button onClick={copyEmail} className="hero-copy-btn" title="Copy email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={refreshInbox} disabled={refreshLoading} className="btn-filled">
            {refreshLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={changeEmail} disabled={changeLoading} className="btn-filled">
            {changeLoading ? 'Changing...' : 'Change'}
          </button>
        </div>
      </section>

      {/* Ad Code - placed below hero section */}
      <div className="ad-wrapper">
        <div className="ad-container" ref={adContainerRef}></div>
      </div>

      {/* Mailbox Section */}
      <section id="mailbox" className="container">
        <div className="mailbox-grid glass">
          {/* Inbox Panel */}
          <div className="inbox-panel">
            <div className="email-display">
              <div className="email-text">{email}</div>
              <button onClick={copyEmail} className="copy-btn" title="Copy email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <div className="inbox-actions" style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={refreshInbox} disabled={refreshLoading}>
                {refreshLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="inbox-header">
              <span>Inbox</span>
              <span className="inbox-count">{messages.length}</span>
            </div>
            <div className="inbox-list">
              {initialLoading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-soft)', marginTop: '2rem' }}>Loading mailbox...</p>
              ) : messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-soft)', marginTop: '2rem' }}>No messages yet</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="inbox-card-wrapper">
                    <button
                      onClick={() => setSelectedMsg(msg)}
                      className={`inbox-card ${selectedMsg?.id === msg.id ? 'active' : ''}`}
                      style={{ paddingRight: '2.5rem' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="inbox-from">
                          {msg.from.replace(/<.*>/, '').replace(/"/g, '').trim() || 'Unknown'}
                        </span>
                        <span className="inbox-time">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="inbox-subject">{msg.subject || '(no subject)'}</p>
                      <p className="inbox-preview">{msg.body_text?.slice(0, 50)}</p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMessage(msg.id)
                      }}
                      disabled={deletingMsgId === msg.id}
                      className="delete-msg-btn"
                      title="Delete message"
                    >
                      {deletingMsgId === msg.id ? (
                        <div className="loader-ring" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-start)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Viewer */}
          <div className="message-viewer">
            {initialLoading ? (
              <div className="message-loader">
                <div className="loader-ring" style={{ width: '48px', height: '48px', borderWidth: '4px' }} />
                <span>Loading messages...</span>
              </div>
            ) : !selectedMsg ? (
              <div className="message-loader">
                <div className="loader-ring" style={{ width: '48px', height: '48px', borderWidth: '4px' }} />
                <span>Waiting for new emails...</span>
              </div>
            ) : (
              <>
                <div className="message-header">
                  <h3 className="message-subject">{selectedMsg.subject || '(no subject)'}</h3>
                  <div className="message-meta">
                    <span>From: <strong>{selectedMsg.from}</strong></span>
                    <span>{new Date(selectedMsg.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginTop: '0.25rem' }}>
                    To: <span style={{ fontFamily: 'monospace' }}>{selectedMsg.to}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(selectedMsg.id)}
                    disabled={deletingMsgId === selectedMsg.id}
                    className="btn-sm btn-preview"
                    style={{ marginTop: '0.75rem' }}
                  >
                    {deletingMsgId === selectedMsg.id ? 'Deleting...' : 'Delete message'}
                  </button>
                </div>
                <div className="message-body">
                  {selectedMsg.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedMsg.body_html }} />
                  ) : (
                    <pre style={{ whiteSpace: 'pre-wrap', fontWeight: 400 }}>{selectedMsg.body_text}</pre>
                  )}
                </div>
                {selectedMsg.attachments && selectedMsg.attachments.length > 0 && (
                  <div className="attachments">
                    <h4 style={{ fontWeight: 400, marginBottom: '0.75rem' }}>
                      📎 Attachments ({selectedMsg.attachments.length})
                    </h4>
                    <div className="attachment-grid">
                      {selectedMsg.attachments.map(att => (
                        <div key={att.id} className="attachment-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-start)" strokeWidth="2">
                              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span style={{ fontWeight: 400, fontSize: '0.8rem', wordBreak: 'break-all' }}>{att.name}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>{(att.size / 1024).toFixed(1)} KB</span>
                          <div className="attach-actions">
                            <button onClick={() => handlePreview(att.id)} className="btn-sm btn-preview">
                              Preview
                            </button>
                            <a href={downloadUrl(att.id)} className="btn-sm btn-download">
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features, Steps, FAQ, SEO, Footer – identical to previous versions */}
      <section id="features" className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: 400 }}>
          Why temp‑mailbox?
        </h2>
        <div className="features-grid">
          {['Instant Email', 'Secure & Anonymous', 'Auto‑Refresh', 'Attachment Support'].map((title, i) => (
            <div key={title} className="glass feature-card">
              <h3>{title}</h3>
              <p style={{ fontWeight: 400, color: 'var(--text-soft)' }}>
                {['One click, no registration.', 'No logs, full privacy.', 'Inbox updates in real time.', 'Preview and download files.'][i]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: 400 }}>
          How It Works
        </h2>
        <div className="steps">
          {['Generate email', 'Use it anywhere', 'Receive messages', 'Delete or change'].map((step, i) => (
            <div key={step} className="glass step-card">
              <div className="step-number">{i + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: 400 }}>
          FAQ
        </h2>
        {[
          { q: 'What is a temporary email?', a: 'A disposable address that expires, protecting your real inbox from spam.' },
          { q: 'Is temp‑mailbox safe?', a: 'Yes, we do not store any personal data.' },
          { q: 'How long do emails last?', a: 'Usually 1–2 hours, but you can change address anytime.' },
          { q: 'Can I receive attachments?', a: 'Absolutely! Preview and download supported.' },
        ].map(faq => (
          <details key={faq.q} className="faq-item">
            <summary className="faq-question">{faq.q}</summary>
            <div className="faq-answer">{faq.a}</div>
          </details>
        ))}
      </section>

      <div className="container seo-block">
        <h2 style={{ fontWeight: 400, marginBottom: '1rem' }}>Free Temporary Email Generator</h2>
        <p>Looking for a temporary email, disposable email, or fake email generator? temp‑mailbox provides instant, secure, and anonymous temporary email addresses. Use our temp mail inbox for newsletters, verifications, and spam avoidance. No signup required. Trusted by thousands daily.</p>
        <p style={{ marginTop: '1rem' }}>With real‑time auto‑refresh, attachment support, and a sleek interface, temp‑mailbox makes disposable email effortless. Stay safe and anonymous – try it now!</p>
      </div>

      <footer className="footer container">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a href="#">About</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
        <span>© {new Date().getFullYear()} temp‑mailbox. All rights reserved.</span>
      </footer>

      <style jsx>{`
        .ad-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 2rem auto;
          padding: 0 1rem;
          width: 100%;
        }
        .ad-container {
          min-height: 90px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          max-width: 728px;
        }
        .ad-container :global(iframe) {
          display: block;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .ad-wrapper {
            margin: 1rem auto;
          }
        }
      `}</style>
    </>
  )
}