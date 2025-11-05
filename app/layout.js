import { Geist, Geist_Mono } from "next/font/google";
import { TimeProvider } from "./context/TimeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorToast from "./components/ErrorToast";
import "./styles/globals.css";

// Disable automatic preload to avoid "preloaded but not used" warnings
// Next will otherwise inject <link rel="preload"> tags for the font files
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata = {
  title: "Meridian — World Time Zones",
  description:
    "Meridian: search world cities, track multiple timezones, and stay synchronized with your global team.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ErrorBoundary>
          <TimeProvider>
            {children}
          </TimeProvider>
          <ErrorToast />
        </ErrorBoundary>
      </body>
    </html>
  );
}
