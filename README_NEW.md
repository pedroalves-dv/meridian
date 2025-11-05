# Meridian

Meridian is a modern web app for tracking multiple time zones around the globe. Built with Next.js, it lets you search for any city, view its current local time, and manage multiple timezones in a customizable dashboard with an intuitive visual timeline—perfect for remote teams, travelers, and anyone working across time zones.

## Features

- 🌍 **Search any city** to instantly see its local time and timezone.
- 🕒 **Live time display** with optional seconds toggle for each timezone.
- 📊 **Visual Timeline** - see all your timezones at once with a synchronized 24-hour view and a centered "NOW" indicator.
- 🎨 **Color-coded hours** - sleep (dark blue), work (green), evening (orange), and off-hours (gray) for easy scanning.
- 🏷️ **Custom labels** - add personalized labels to each timezone card (e.g., "Team Meeting", "Mom's Timezone").
- ⏰ **Time difference display** - instantly see how many hours ahead or behind each timezone is from your location.
- 🗂️ **Customizable dashboard** - add, remove, and reorder timezones with drag-and-drop.
- 📍 **Auto-detect location** - your current timezone appears at the top and stays fixed while organizing others.
- 🌗 **Dark mode toggle** with smooth transitions and logo inversion.
- ⚡ **Fast, responsive UI** built with Next.js 15 and React 19.
- 💾 **Persistent storage** - all data saved locally in your browser.

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/pedroalves-dv/meridian.git
cd meridian
npm install
```

Create a `.env.local` file in the root directory and add your API keys:

```env
TIMEZONE_DB_API_KEY=your_timezone_db_api_key
NEXT_PUBLIC_GEONAMES_USERNAME=your_geonames_username
NEXT_PUBLIC_WORLDTIME_API=https://worldtimeapi.org/api
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding Timezones
- Use the search bar to find any city or timezone.
- Click a suggestion to add it to your dashboard.
- Your current location is automatically detected and displayed at the top.

### Visual Timeline
- The left panel shows a synchronized 24-hour timeline for all your timezones.
- The centered "NOW" line shows the current moment across all timezones.
- Color-coded segments help you quickly identify work hours, sleep time, and more.
- Hours shift smoothly every minute for real-time tracking.

### Timezone Cards
- **Show/Hide Seconds**: Click the "s" button next to the time to toggle seconds display.
- **Custom Labels**: Click "Add Label" to personalize each timezone (e.g., "Office Hours", "Family").
- **Time Difference**: See at a glance how many hours ahead (+) or behind (-) each timezone is from yours.
- **Drag & Drop**: Reorder your timezones by dragging cards (your location stays fixed at the top).
- **Remove**: Delete any timezone card except your auto-detected location.

### Customization
- Toggle dark mode using the sun/moon icon in the header.
- All preferences and timezones are saved locally in your browser.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **DND Kit 6.3** - Drag and drop functionality
- **Photon API** - OpenStreetMap geocoding with English language support
- **TimezoneDB API** - Timezone data and conversions
- **GeoNames API** - Geolocation services
- **ipapi.co** - User location detection

## API Keys

To run this app, you'll need free API keys from:
- [TimezoneDB](https://timezonedb.com/api) - for timezone information
- [GeoNames](https://www.geonames.org/export/web-services.html) - for geocoding (free account required)

## Contributing

PRs welcome! Please:
- Add tests for new features
- Run the linting script before submitting
- Follow the existing code style

## License

MIT

---

Built with ❤︎ using Next.js.
