'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { analyzeIntent } from '@/utils/botLogic';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: number;
}

export default function MageBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        const checkTheme = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') as 'dark' | 'light' || 'dark';
            setTheme(currentTheme);
        };
        checkTheme();
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    checkTheme();
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (isVisible && messages.length === 0) {
            setMessages([{
                id: 'init',
                text: "How can I help you today?",
                sender: 'bot',
                timestamp: Date.now()
            }]);
        }
    }, [isVisible]);

    useEffect(() => {
        if (isOpen && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        const action = analyzeIntent(userMsg.text);

        setTimeout(() => {
            setIsTyping(false);

            if (action.payload?.context && Object.keys(action.payload.context).length > 0) {
                localStorage.setItem('magetool_context', JSON.stringify(action.payload.context));
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: action.response || "...",
                sender: 'bot',
                timestamp: Date.now()
            }]);

            if (action.intent === 'GOTO_TOOL') {
                setTimeout(() => {
                    router.push(action.payload.path);
                }, 1500);
            }
        }, 800 + Math.random() * 500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    if (!isVisible) return null;

    const isLight = theme === 'light';

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none' }}>

            <div style={{ pointerEvents: 'auto' }}>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            style={{
                                marginBottom: '20px',
                                width: '360px',
                                height: '520px',
                                borderRadius: '28px',
                                boxShadow: isLight
                                    ? '0 20px 50px -10px rgba(0,0,0,0.2), 0 0 20px rgba(2, 132, 199, 0.15)'
                                    : '0 20px 50px -10px rgba(0,0,0,0.5), 0 0 20px rgba(0, 217, 255, 0.1)',
                                background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)',
                                borderColor: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.08)',
                                border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'}`,
                                backdropFilter: 'blur(20px)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '18px 20px',
                                background: isLight
                                    ? 'linear-gradient(90deg, rgba(2, 132, 199, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)'
                                    : 'linear-gradient(90deg, rgba(0, 217, 255, 0.1) 0%, rgba(121, 40, 202, 0.1) 100%)',
                                borderBottom: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flexShrink: 0
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: isLight ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'linear-gradient(135deg, #06b6d4, #6366f1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
                                }}>
                                    <Bot size={22} color="white" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: isLight ? '#1e293b' : '#fff' }}>MageBot AI</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                                        <span style={{ fontSize: '11px', color: isLight ? '#64748b' : '#94a3b8' }}>Online</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: isLight ? '#64748b' : '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Messages Area - FIXED SCROLLABLE */}
                            <div
                                ref={messagesContainerRef}
                                style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}
                            >
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            display: 'flex',
                                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        {msg.sender === 'bot' && (
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: isLight ? '#e0e7ff' : 'rgba(99, 102, 241, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '8px',
                                                marginTop: '4px',
                                                flexShrink: 0
                                            }}>
                                                <Bot size={14} color={isLight ? '#6366f1' : '#a5b4fc'} />
                                            </div>
                                        )}
                                        <div
                                            style={{
                                                maxWidth: '80%',
                                                padding: '12px 16px',
                                                borderRadius: '18px',
                                                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                                                borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '18px',
                                                background: msg.sender === 'user'
                                                    ? (isLight ? 'linear-gradient(135deg, #0284c7, #4f46e5)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)')
                                                    : (isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)'),
                                                color: msg.sender === 'user' ? '#fff' : (isLight ? '#1e293b' : '#fff'),
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                boxShadow: msg.sender === 'user'
                                                    ? '0 4px 15px rgba(2, 132, 199, 0.25)'
                                                    : (isLight ? '0 2px 10px rgba(0,0,0,0.05)' : '0 2px 10px rgba(0,0,0,0.1)'),
                                                border: msg.sender === 'bot' ? (isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)') : 'none'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                        />
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', marginLeft: '32px' }}>
                                        <div style={{
                                            padding: '12px 16px',
                                            borderRadius: '18px',
                                            borderTopLeftRadius: '4px',
                                            background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                                            border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            gap: '6px',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLight ? '#0ea5e9' : '#06b6d4', animation: 'bounce 1s infinite' }} />
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLight ? '#0ea5e9' : '#06b6d4', animation: 'bounce 1s infinite 0.15s' }} />
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLight ? '#0ea5e9' : '#06b6d4', animation: 'bounce 1s infinite 0.3s' }} />
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div style={{
                                padding: '16px 20px',
                                borderTop: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)',
                                background: isLight ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                                flexShrink: 0
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Try 'video converter' or 'compress pdf'..."
                                        style={{
                                            flex: 1,
                                            padding: '14px 48px 14px 20px',
                                            borderRadius: '24px',
                                            border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                                            background: isLight ? 'rgba(241,245,249,0.8)' : 'rgba(30,41,59,0.6)',
                                            color: isLight ? '#1e293b' : '#fff',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputText.trim() || isTyping}
                                        style={{
                                            position: 'absolute',
                                            right: '6px',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: isLight ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
                                            opacity: (!inputText.trim() || isTyping) ? 0.5 : 1,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Send size={18} color="white" style={{ marginLeft: '2px' }} />
                                    </button>
                                </div>
                                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px', color: isLight ? '#94a3b8' : '#64748b' }}>
                                    Spandan Prayas Patra ft. Aero
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '24px',
                    background: isLight
                        ? 'linear-gradient(135deg, #0284c7, #7c3aed)'
                        : 'linear-gradient(135deg, #06b6d4, #7c3aed)',
                    border: isLight ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isLight
                        ? '0 10px 40px -10px rgba(2, 132, 199, 0.4), 0 0 20px rgba(255,255,255,0.4) inset'
                        : '0 10px 40px -10px rgba(6, 182, 212, 0.6), 0 0 20px rgba(255,255,255,0.2) inset',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 20
                }}
            >
                {!isOpen && messages.length <= 1 && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '20px',
                        height: '20px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid #0f172a'
                    }}>
                        <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }} />
                    </span>
                )}

                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X color="white" size={32} strokeWidth={2.5} />
                        </motion.div>
                    ) : (
                        <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <Bot color="white" size={32} strokeWidth={2.5} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            <style jsx global>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
}
