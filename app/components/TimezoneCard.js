"use client";

import { useState, useEffect, useMemo } from "react";
import { useNow } from "../context/TimeContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDisplayName, formatGmt } from "@/lib/utils/formatting";

export default function TimezoneCard({
  timezone: tz,
  city,
  lat,
  lon,
  onRemove,
  userTimezone,
}) {
  const isUserLocation = tz.isUserLocation || tz.id === 'user-location';
  
  // dnd-kit sortable - disable for user location
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: tz.id,
    disabled: isUserLocation,
  });
  const transformStyle = transform ? CSS.Transform.toString(transform) : undefined;
  const style = {
    ...(transformStyle ? { transform: transformStyle } : {}),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isUserLocation ? 'default' : (isDragging ? 'grabbing' : 'grab'),
  };

  const [timeData, setTimeData] = useState(null);
  const now = useNow();
  const [timeError, setTimeError] = useState(null);
  const [showSeconds, setShowSeconds] = useState(false);
  const [customLabel, setCustomLabel] = useState(tz.customLabel || "");
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const endpoint = lat && lon
          ? `/api/timezone?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
          : `/api/timezone?zone=${encodeURIComponent(tz.timezone)}`;

        const res = await fetch(endpoint);
        const data = await res.json();
        if (!res.ok) {
          const errMsg = data?.error || 'Failed to fetch timezone info';
          console.warn('Timezone API returned error for', tz.timezone, errMsg);
          setTimeError(errMsg);
          // Fallback: use client-side timezone to at least display local time
          setTimeData({ timeZone: tz.timezone, currentUtcOffset: null, currentLocalTime: null, _fallback: true });
        } else {
          setTimeError(null);
          setTimeData(data);
        }
      } catch (error) {
        console.error("Error fetching time:", error);
        // Client-side fallback when network/API fails
        setTimeError(error.message || 'Error fetching timezone');
        setTimeData({ timeZone: tz.timezone, currentUtcOffset: null, currentLocalTime: null, _fallback: true });
      }
    };

    fetchTime();
    return () => {};
  }, [tz, lat, lon]);

  const formattedTime = useMemo(() => {
    if (!now || !timeData) return "Loading...";
    const options = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timeData.timeZone,
    };
    if (showSeconds) {
      options.second = "2-digit";
    }
    return now.toLocaleTimeString([], options);
  }, [now, timeData, showSeconds]);

  const formattedDate = useMemo(() => {
    if (!now || !timeData) return "Loading...";
    return now.toLocaleDateString([], {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: timeData.timeZone,
    });
  }, [now, timeData]);

  // Calculate time difference from user's location
  const timeDifference = useMemo(() => {
    if (!now || !timeData || !userTimezone || isUserLocation) return null;
    
    try {
      // Get the current hour in both timezones
      const userHour = parseInt(now.toLocaleTimeString([], { 
        hour: "numeric", 
        hour12: false, 
        timeZone: userTimezone 
      }));
      
      const localHour = parseInt(now.toLocaleTimeString([], { 
        hour: "numeric", 
        hour12: false, 
        timeZone: timeData.timeZone 
      }));
      
      // Calculate difference
      let diff = localHour - userHour;
      
      // Handle wraparound (e.g., 23 - 1 = 22, but should be -2)
      if (diff > 12) diff -= 24;
      if (diff < -12) diff += 24;
      
      return diff;
    } catch (error) {
      console.error("Error calculating time difference:", error);
      return null;
    }
  }, [now, timeData, userTimezone, isUserLocation]);

    return (
    <div 
      className={`timezone-card ${isUserLocation ? 'user-location' : ''}`} 
      ref={setNodeRef} 
      style={style} 
      {...(isUserLocation ? {} : attributes)} 
      {...(isUserLocation ? {} : listeners)}
    >
      <div className="card-header">
        <div className="location-info-display">
          <div className="city-row">
            <span className="city-country-display">
              {formatDisplayName(city)}
            </span>
          </div>
          <div className="gmt-date-row">
            <span className="gmt">{formatGmt(timeData?.currentUtcOffset)}</span>
            {timeDifference !== null && (
              <span className="time-diff">
                {`${timeDifference >= 0 ? '+' : ''}${timeDifference}h`}
              </span>
            )}
            <span className="date-display">{formattedDate}</span>
          </div>
        </div>

        <div className="time-display-wrapper">
          <div className="time-display">
            {timeError ? <span className="error">{timeError}</span> : formattedTime}
            {timeData?._fallback && (
              <small className="fallback-note"> (using timezone fallback)</small>
            )}
          </div>
          <button
            className="toggle-seconds-button-inline"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setShowSeconds(!showSeconds)}
            title={showSeconds ? "Hide seconds" : "Show seconds"}
          >
            {showSeconds ? "m" : "s"}
          </button>
        </div>
      </div>

      <div className="card-middle">
        {isEditingLabel ? (
          <textarea
            className="label-input"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === ' ') {
                e.stopPropagation();
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                setIsEditingLabel(false);
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setIsEditingLabel(false);
              }
            }}
            placeholder="Label..."
            autoFocus
            rows={1}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          customLabel && (
            <div className="label-display" title={customLabel}>
              {customLabel}
            </div>
          )
        )}
      </div>

      <div className="card-actions">
        {isEditingLabel ? (
          <div className="label-actions-row">
            <button
              className="label-clear-button"
              onClick={(e) => {
                e.stopPropagation();
                setCustomLabel('');
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              title="Clear label"
            >
              ↺
            </button>
            <button
              className="label-confirm-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingLabel(false);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              title="Confirm label"
            >
              ✓
            </button>
          </div>
        ) : (
          <button
            className="label-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingLabel(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            title="Add custom label"
          >
            {customLabel ? "Edit" : "Add Label"}
          </button>
        )}
        {!isUserLocation && (
          <button
            className="remove-button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onRemove(tz.id)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
