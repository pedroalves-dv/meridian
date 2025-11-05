"use client";

import TimezoneCard from "./TimezoneCard";

export default function TimezoneList({ timezones, onRemove, userTimezone }) {
  if (!timezones || !timezones.length) return null;

  return (
    <div className="timezone-list">
      {timezones.map((tz) => (
        <div key={tz.id} data-id={tz.id}>
          <TimezoneCard city={tz.city} lat={tz.lat} lon={tz.lon} timezone={tz} onRemove={onRemove} userTimezone={userTimezone} />
        </div>
      ))}
    </div>
  );
}