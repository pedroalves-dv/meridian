"use client";
import { createContext, useContext, useEffect, useState } from "react";

const TimeContext = createContext(new Date());

export function TimeProvider({ children }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update every second for real-time seconds display
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return <TimeContext.Provider value={now}>{children}</TimeContext.Provider>;
}

export function useNow() {
  return useContext(TimeContext);
}
