"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ErrorToast component for displaying user-friendly error notifications
 * Usage: Import and use the showErrorToast function from anywhere in your app
 */

let toastQueue = [];
let listeners = [];

export function showErrorToast(message, duration = 5000) {
  const id = Date.now() + Math.random();
  toastQueue.push({ id, message, duration });
  listeners.forEach(listener => listener([...toastQueue]));
  
  // Auto-remove after duration
  setTimeout(() => {
    removeToast(id);
  }, duration);
}

function removeToast(id) {
  toastQueue = toastQueue.filter(toast => toast.id !== id);
  listeners.forEach(listener => listener([...toastQueue]));
}

export default function ErrorToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Subscribe to toast updates
    const listener = (newToasts) => setToasts(newToasts);
    listeners.push(listener);
    
    // Initial state
    setToasts([...toastQueue]);
    
    // Cleanup
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        maxWidth: "400px",
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: "var(--mid, #ffffff)",
              color: "var(--text, #202020)",
              padding: "1rem 1.25rem",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              border: "2px solid #d32f2f",
            }}
          >
            <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text, #202020)",
                cursor: "pointer",
                fontSize: "1.25rem",
                padding: 0,
                lineHeight: 1,
                opacity: 0.6,
                flexShrink: 0,
              }}
              aria-label="Close notification"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
