"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DndContext, closestCenter, pointerWithin, rectIntersection, getFirstCollision } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import Header from "./Header";
import TimezoneList from "./TimezoneList";
import VisualTimeline from "./VisualTimeline";
import Footer from "./Footer";

const DND_MODIFIERS = [restrictToVerticalAxis];

export default function AppLayout() {
  const [timezones, setTimezones] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // Detect user's location on mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const locationRes = await fetch("https://ipapi.co/json/");
        if (!locationRes.ok) throw new Error("Failed to detect location");

        const locationData = await locationRes.json();
        const { latitude, longitude, timezone, city, country_name } = locationData;

        if (latitude && longitude && timezone) {
          setUserLocation({
            timezone,
            id: 'user-location',
            identifier: `${latitude},${longitude}`,
            city: `${city}, ${country_name}`,
            lat: latitude,
            lon: longitude,
            isUserLocation: true,
          });
        }
      } catch (error) {
        console.error("Error detecting user location:", error);
        // Fallback to browser timezone
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setUserLocation({
          timezone: browserTz,
          id: 'user-location',
          identifier: browserTz,
          city: 'Your Location',
          lat: null,
          lon: null,
          isUserLocation: true,
        });
      }
    };

    fetchUserLocation();
  }, []);

  // Load saved timezones on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timezones');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that it's an array
        if (Array.isArray(parsed)) {
          // Validate each timezone object has required properties
          const validated = parsed.filter(tz => 
            tz && 
            typeof tz === 'object' && 
            tz.id && 
            tz.timezone
          );
          setTimezones(validated);
        } else {
          console.warn('Invalid timezones data in localStorage, resetting');
          localStorage.removeItem('timezones');
        }
      }
    } catch (error) {
      console.error('Error loading timezones from localStorage:', error);
      localStorage.removeItem('timezones');
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timezones', JSON.stringify(timezones));
    } catch (error) {
      console.error('Error saving timezones to localStorage:', error);
    }
  }, [timezones]);

  const handleOnSearch = (timezone) => {
    // Determine identifier: prefer lat/lon when available so multiple cities in the same timezone can be added
    const identifier = (timezone.lat && timezone.lon)
      ? `${timezone.lat},${timezone.lon}`
      : (timezone.identifier || timezone.timezone);
    
    // Check for duplicates more thoroughly
    const exists = timezones.find((t) => {
      // Match by identifier (lat/lon combo)
      if (identifier && t.identifier === identifier) return true;
      // Match by timezone AND city name to prevent duplicate cities
      if (t.timezone === timezone.timezone && t.city === timezone.city) return true;
      return false;
    });
    
    if (exists) {
      // Timezone already exists - no need to add again
      return;
    }
    
    setTimezones((prev) => [
      ...prev,
      {
        timezone: timezone.timezone,
        id: Date.now(),
        identifier,
        city: timezone.city,
        lat: timezone.lat,
        lon: timezone.lon,
      },
    ]);
  };

  // Custom collision detection that excludes user-location
  const customCollisionDetection = useCallback((args) => {
    // First, let's get all potential collisions
    const pointerCollisions = pointerWithin(args);
    const intersectionCollisions = rectIntersection(args);
    
    // Combine and filter out user-location
    let collisions = pointerCollisions.length > 0 ? pointerCollisions : intersectionCollisions;
    
    // Filter out the user-location from being a valid drop target
    collisions = collisions.filter(collision => collision.id !== 'user-location');
    
    // If no valid collisions after filtering, return empty
    if (collisions.length === 0) {
      return [];
    }
    
    // Return the first valid collision
    return [collisions[0]];
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    // If there's no valid drop target or dropping on itself, do nothing (card snaps back)
    if (!over || active.id === over.id) return;
    
    // Extra safety: ensure we're not trying to interact with user-location
    if (over.id === 'user-location') return;
    
    setTimezones((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id);
      const newIndex = prev.findIndex((p) => p.id === over.id);
      
      // If either index is not found, don't do anything
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // Handles Remove Button
  const handleRemove = (id) => {
    // Prevent removing user's location
    if (id === 'user-location') return;
    setTimezones(prev => prev.filter(tz => tz.id !== id));
  };

  // Combine user location with added timezones
  const allTimezones = useMemo(() => {
    if (!userLocation) return timezones;
    return [userLocation, ...timezones];
  }, [userLocation, timezones]);

  // Only include sortable items (exclude user-location from being sortable)
  const sortableItems = useMemo(() => 
    timezones.map((t) => t.id), 
    [timezones]
  );

  return (
    <div className="container">
      <Header onSearch={handleOnSearch} />
      
      <div className="main-layout">
        <div className="timezone-section">
          <DndContext collisionDetection={customCollisionDetection} onDragEnd={handleDragEnd} modifiers={DND_MODIFIERS}>
            <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
              <TimezoneList timezones={allTimezones} onRemove={handleRemove} userTimezone={userLocation?.timezone} />
            </SortableContext>
          </DndContext>
        </div>
        
        <div className="timeline-section">
          <VisualTimeline timezones={allTimezones} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}