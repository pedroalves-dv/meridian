/**
 * Format a full display name to show just city and country
 * @param {string} display_name - Full location string with comma-separated parts
 * @returns {string} Formatted string showing city and country
 * @example
 * formatDisplayName("New York, New York, United States")
 * // Returns: "New York, United States"
 */
export function formatDisplayName(display_name) {
  if (!display_name) return "";
  const parts = display_name.split(",");
  const trimmed = parts.map((p) => p.trim()).filter(Boolean);
  // Show first and last part (city and country)
  if (trimmed.length >= 2) {
    return `${trimmed[0]}, ${trimmed[trimmed.length - 1]}`;
  }
  return trimmed[0] || "";
}

/**
 * Format UTC offset in hours to GMT string
 * @param {number|null} offsetHours - Offset from UTC in hours (can be fractional)
 * @returns {string} Formatted GMT offset string
 * @example
 * formatGmt(5.5) // Returns: "GMT+5.5"
 * formatGmt(-8) // Returns: "GMT-8"
 */
export function formatGmt(offsetHours) {
  if (offsetHours === null || offsetHours === undefined || offsetHours === "") {
    return "GMT —";
  }
  // offset can be fractional
  const sign = offsetHours >= 0 ? "+" : "-";
  const abs = Math.abs(offsetHours);
  // show integer if whole, else one decimal
  const str = Number.isInteger(abs) ? `${abs}` : `${abs.toFixed(1)}`;
  return `GMT${sign}${str}`;
}
