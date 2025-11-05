# Meridian

Meridian is a modern web app for tracking multiple time zones around the globe. Built with Next.js, it lets you search for any city, view its current local time, and manage multiple timezones in a customizable dashboard—perfect for remote teams, travelers, and anyone working across time zones.

## Features

- 🌍 **Search any city** to instantly see its local time and timezone.
- 🕒 **Live time display** that updates every second.
- 🗂️ **Customizable dashboard** - add, remove, and reorder timezones with drag-and-drop.
- � **Auto-detect location** to show your current timezone automatically.
- 🌗 **Dark mode toggle** for comfortable viewing.
- ⚡ **Fast, responsive UI** built with Next.js and React.
- 💾 **Persistent storage** - all data saved locally in your browser.

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/meridian.git
cd meridian
npm install
```

Create a `.env.local` file in the root directory and add your API keys:

```env
TIMEZONE_DB_API_KEY=your_timezone_db_api_key
NEXT_PUBLIC_GEONAMES_USERNAME=your_geonames_username
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Use the search bar to find any city or timezone.
- Click a suggestion to add it to your dashboard.
- View live local time for each saved location.
- Drag and drop to reorder your saved timezones.
- Toggle dark mode using the sun/moon icon.
- All data is saved locally in your browser.

## Tech stack

- Next.js 15
- React 19
- Photon API (OpenStreetMap geocoding), TimezoneDB, GeoNames APIs
- DND Kit for drag and drop
- Framer Motion for animations

## Contributing

PRs welcome. Please add tests for new features and run the linting script.

## License

MIT

---

Built with ❤️ using Next.js.
