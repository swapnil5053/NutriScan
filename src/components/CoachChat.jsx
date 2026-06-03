import { useState, useRef, useEffect } from 'react';
import { chatWithCoach } from '../services/api.js';
import { motion } from 'motion/react';

export function CoachChat({ mealHistory, userGoals }) {
  const getInitialMessage = (history) => {
    if (history.length === 0) {
      return "Log your first meal to start unlocking personalized dietary tactics and habit analysis.";
    } else if (history.length < 3) {
      return `I see you've logged ${history.length} meal${history.length > 1 ? 's' : ''}. Keep tracking to reveal deeper structural patterns in your macro distribution.`;
    }

    const avgFiber = history.reduce((acc, m) => acc + (m.fiber || 0), 0) / history.length;
    if (avgFiber < 5) {
      return "You consistently miss fiber targets across your logged meals. Consider swapping out refined carbs for a fiber-rich alternative to close the gap.";
    }

    return "I've analyzed your recent meals. Your macronutrient baseline is stabilizing. Would you like to review your dominant dietary patterns or set new tactical goals?";
  };

  const [messages, setMessages] = useState([
    { role: 'coach', text: getInitialMessage(mealHistory) }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0 && newMessages[0].role === 'coach') {
        newMessages[0] = { ...newMessages[0], text: getInitialMessage(mealHistory) };
      }
      return newMessages;
    });
  }, [mealHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const resp = await chatWithCoach(userMessage, mealHistory, userGoals);
      setMessages(prev => [...prev, { role: 'coach', text: resp.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'coach', text: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="flex flex-col gap-12" ref={scrollRef}>
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            key={i}
            className={`${
              msg.role === 'user'
                ? 'text-[1.125rem] leading-relaxed pl-6 border-l w-max max-w-[85%] ml-auto border-[var(--border-subtle)] text-[var(--text-muted)]'
                : 'text-[1rem] md:text-[1.125rem] leading-[1.6] text-[var(--text-secondary)] font-normal max-w-full'
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex flex-col gap-3 max-w-[85%] animate-pulse">
            <div className="h-4 bg-[var(--surface-raised)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--surface-raised)] rounded w-full"></div>
            <div className="h-4 bg-[var(--surface-raised)] rounded w-5/6"></div>
          </div>
        )}
      </div>

      <div className="pt-6 relative pb-12 group">
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.1)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none rounded-b-xl" />
        <textarea
          className="w-full bg-transparent border-b border-[var(--border-subtle)] text-[1.25rem] py-4 outline-none focus:border-[var(--text-primary)] transition-all resize-none placeholder-[var(--text-muted)] group-focus-within:shadow-[0_20px_40px_-20px_var(--spotlight-color)] dark:group-focus-within:shadow-[0_20px_40px_-20px_rgba(255,255,255,0.1)] relative z-10"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about your diet patterns..."
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
