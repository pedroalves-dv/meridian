import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const API_KEY = process.env.TIMEZONE_DB_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    // Get the timezone from the query string
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    // If lat/lon provided, use GeoNames as primary source
    if (lat && lon) {
      try {
        const geoRes = await fetch(`https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=${process.env.NEXT_PUBLIC_GEONAMES_USERNAME}`);
        const geoData = await geoRes.json();
        if (geoRes.ok && geoData && geoData.timezoneId && geoData.time) {
          return NextResponse.json({
            currentLocalTime: geoData.time,
            timeZone: geoData.timezoneId,
            currentUtcOffset: geoData.gmtOffset ?? null,
          });
        }
        // fallthrough to zone lookup if geo fails
      } catch (err) {
        console.error('GeoNames lookup failed in timezone route:', err.message || err);
      }
    }
    if (!zone) {
      return NextResponse.json({ error: "Missing timezone parameter" }, { status: 400 });
    }
  // First try TimezoneDB (by zone)
    const tzdbUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=zone&zone=${zone}`;
    try {
      const response = await fetch(tzdbUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.zoneName && data.formatted) {
          return NextResponse.json({
            currentLocalTime: data.formatted,
            timeZone: data.zoneName,
            currentUtcOffset: data.gmtOffset / 3600, // convert seconds to hours
          });
        }
      }
    } catch (err) {
      // Log and continue to fallback
      console.error("TimezoneDB request failed:", err.message || err);
    }

    // Fallback: try WorldTimeAPI (public, no key required)
    const worldApiRoot = process.env.NEXT_PUBLIC_WORLDTIME_API || "https://worldtimeapi.org/api";
    try {
      const wRes = await fetch(`${worldApiRoot}/timezone/${encodeURIComponent(zone)}`);
      if (wRes.ok) {
        const wData = await wRes.json();
        // worldtimeapi returns datetime and timezone
        const currentLocalTime = wData.datetime || wData.utc_datetime || null;
        const timeZone = wData.timezone || zone;
        // utc_offset like "+01:00" -> convert to hours
        let currentUtcOffset = null;
        if (wData.utc_offset) {
          const m = wData.utc_offset.match(/([+-])(\d{2}):(\d{2})/);
          if (m) {
            const sign = m[1] === "-" ? -1 : 1;
            currentUtcOffset = sign * (parseInt(m[2], 10) + parseInt(m[3], 10) / 60);
          }
        }
        return NextResponse.json({ currentLocalTime, timeZone, currentUtcOffset });
      }
    } catch (err) {
      console.error("WorldTimeAPI fallback failed:", err.message || err);
    }

    // If we got here and the caller provided a zone, return a safe fallback
    if (zone) {
      console.warn('Timezone APIs failed for zone', zone, '- returning client-side fallback');
      return NextResponse.json({ timeZone: zone, currentLocalTime: new Date().toISOString(), currentUtcOffset: null, _fallback: true });
    }

    return NextResponse.json({ error: "Unable to fetch timezone data" }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}