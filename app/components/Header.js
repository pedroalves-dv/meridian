"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MdLightMode, MdDarkMode  } from "react-icons/md";
import SearchBar from "./SearchBar";

export default function Header({ onSearch }) {
  const [darkMode, setDarkMode] = useState(false);
  const timeoutRefs = useRef([]);

  // Hydrate theme from localStorage and DOM on mount
  useEffect(() => {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || html.classList.contains('dark-mode');
    
    setDarkMode(isDark);
    html.classList.toggle('dark-mode', isDark);
    
    // Cleanup timeouts on unmount
    const timeouts = timeoutRefs.current;
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const currentDark = html.classList.contains('dark-mode');
    const makeDark = !currentDark;
    
    setDarkMode(makeDark);
    localStorage.setItem('theme', makeDark ? 'dark' : 'light');

    // Get current background color for overlay
    const computedBg = getComputedStyle(html).getPropertyValue('--background');
    const overlayColor = computedBg.trim() || (currentDark ? '#202020' : '#ededed');

    // Remove any existing overlay
    const existing = document.getElementById('theme-overlay');
    if (existing) existing.remove();

    // Create overlay element to mask instant color changes
    const overlay = document.createElement('div');
    overlay.id = 'theme-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background-color: ${overlayColor};
      pointer-events: none;
      z-index: 2147483647;
      opacity: 1;
      transition: opacity 300ms ease;
    `;
    document.body.appendChild(overlay);

    // Force reflow before toggling theme
    void overlay.offsetHeight;

    // Toggle theme class
    html.classList.toggle('dark-mode', makeDark);

    // Fade out overlay and cleanup
    const fadeTimeout = setTimeout(() => {
      overlay.style.opacity = '0';
    }, 20);
    
    const cleanupTimeout = setTimeout(() => {
      overlay.remove();
    }, 360);
    
    timeoutRefs.current.push(fadeTimeout, cleanupTimeout);
  };

  return (
    <div className="header">
      <div className="left-nav">
        <Link href="/" className="logo">
          <Image src="/assets/logo.png" alt="Meridian Logo" width={20} height={20} className="logo-image" />
          Meridian
        </Link>
      </div>
      <SearchBar onSearch={onSearch} />

      <div className="right-nav">
        <button
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <MdLightMode size={16} /> : <MdDarkMode size={16} />}
        </button>
      </div>
    </div>
  );
}
