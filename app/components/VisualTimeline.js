"use client";

import { useMemo } from "react";
import { useNow } from "../context/TimeContext";
import { formatDisplayName } from "@/lib/utils/formatting";

/**
 * Visual Timeline Component
 * Shows a 24-hour timeline for all tracked timezones with color-coded segments
 */
export default function VisualTimeline({ timezones }) {
  const now = useNow();

  // Calculate what hour and minute it is in each timezone
  const timelineData = useMemo(() => {
    if (!now || !timezones || timezones.length === 0) return [];

    return timezones.map((tz) => {
      const date = new Date(now);
      
      // Get current hour (0-23)
      const hourOptions = { 
        timeZone: tz.timezone,
        hour: 'numeric',
        hour12: false 
      };
      const currentHour = parseInt(
        date.toLocaleString('en-US', hourOptions).split(',')[0]
      );

      // Get current minutes (0-59)
      const minuteOptions = {
        timeZone: tz.timezone,
        minute: 'numeric'
      };
      const currentMinute = parseInt(
        date.toLocaleString('en-US', minuteOptions).split(',')[0]
      );

      // Calculate decimal hour (e.g., 15:30 = 15.5)
      const currentHourDecimal = currentHour + (currentMinute / 60);

      // Get formatted current time for display
      const currentTime = date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: tz.timezone,
      });

      return {
        id: tz.id,
        city: tz.city,
        timezone: tz.timezone,
        currentHour,
        currentMinute,
        currentHourDecimal,
        currentTime,
      };
    });
  }, [now, timezones]);

  /**
   * Determine segment type for a given hour
   * Returns: 'sleep', 'work', 'evening', or 'off'
   */
  const getSegmentType = (hour) => {
    if (hour >= 23 || hour < 7) return 'sleep'; // 11 PM - 7 AM
    if (hour >= 9 && hour < 17) return 'work';   // 9 AM - 5 PM
    if (hour >= 17 && hour < 23) return 'evening'; // 5 PM - 11 PM
    return 'off'; // 7 AM - 9 AM
  };

  /**
   * Generate 25 hour segments creating a sliding window
   * The window shifts based on minutes to create smooth movement
   * At minute 0: segments represent hours [currentHour-12] to [currentHour+12]
   * At minute 30: segments represent hours [currentHour-11.5] to [currentHour+12.5]
   * This creates the illusion of continuous generation on the right
   */
  const generateSegments = (currentHour, currentMinute) => {
    const segments = [];
    
    // Calculate the starting offset based on minutes
    // At minute 0: start at -12
    // At minute 30: start at -11 (we've shifted one segment, so -12 is hidden, -11 is now leftmost)
    // At minute 59: start at -11 (almost ready to jump to next hour)
    const baseOffset = -12;
    
    // Generate 25 segments for the sliding window
    for (let i = 0; i < 25; i++) {
      const offset = baseOffset + i;
      // Calculate actual hour with wrapping (0-23)
      const hour = (currentHour + offset + 24) % 24;
      const type = getSegmentType(hour);
      // Center segment (offset 0) is the current hour
      const isCurrent = offset === 0;
      
      segments.push({ 
        hour, 
        type, 
        isCurrent,
        offset,
        // Label for display (relative to NOW)
        relativeLabel: offset === 0 ? 'NOW' : offset > 0 ? `+${offset}h` : `${offset}h`
      });
    }
    return segments;
  };

  if (!timezones || timezones.length === 0) {
    return (
      <div className="visual-timeline">
        <div className="timeline-empty">
          <p>Add timezones to see the visual timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="visual-timeline">
      <div className="timeline-header">
        <div className="timeline-header-top">
          <h2>Visual Timeline</h2>
          <div className="timeline-legend">
            <span className="legend-item">
              <span className="legend-color sleep"></span> Sleep
            </span>
            <span className="legend-item">
              <span className="legend-color work"></span> Work
            </span>
            <span className="legend-item">
              <span className="legend-color evening"></span> Evening
            </span>
            <span className="legend-item">
              <span className="legend-color off"></span> Off-hours
            </span>
          </div>
        </div>
        <p className="timeline-subtitle">All times aligned to NOW</p>
      </div>

      <div className="timeline-container">
        {/* Fixed NOW line that spans all timezones */}
        <div className="timeline-now-line">
          <span className="now-label">NOW</span>
        </div>

        {timelineData.map((data) => {
          const segments = generateSegments(data.currentHour, data.currentMinute);
          
          // Calculate shift amount based on minutes
          // We show 24 visible segments (the NOW line is at 50% = center of 24 visible)
          // Each visible segment represents 1/24 of the visible width (4.167%)
          // As minutes pass, we shift left by (minutes/60) of one segment width
          const minuteShiftPercent = (data.currentMinute / 60) * (100 / 24);
          
          return (
            <div key={data.id} className="timeline-row">
              <div className="timeline-label">
                <span className="timeline-city">{formatDisplayName(data.city)}</span>
                <span className="timeline-time">{data.currentTime}</span>
              </div>
              
              <div 
                className="timeline-bar"
                style={{
                  transform: `translateX(-${minuteShiftPercent}%)`,
                  transition: 'transform 1s linear'
                }}
              >
                {segments.map((segment, idx) => (
                  <div
                    key={idx}
                    className={`timeline-segment ${segment.type}`}
                    title={`${segment.hour}:00 (${segment.relativeLabel}) - ${segment.type}`}
                    data-hour={segment.hour}
                    data-offset={segment.offset}
                  >
                    {/* Hour divider line */}
                    {idx > 0 && <div className="hour-divider" />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="timeline-axis">
        <span className="axis-label left">12h ago</span>
        <span className="axis-label right">12h ahead</span>
      </div>
    </div>
  );
}
