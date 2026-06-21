import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "LanScout 🌸 — Chị ấy tìm nhà cho bạn",
  description: "Lan is your quirky Vietnamese globe-trotting property scout — searching cities worldwide with cultural insights, local food tips, events, and weather. Được quá!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 bg-white mt-8">
          <p>🌸 LanScout là công cụ tìm kiếm thôi — always verify listings with a licensed real estate agent!</p>
          <p className="mt-1">Listings from Realtor.com · Weather from OpenWeatherMap · Events from Ticketmaster · Dining from Yelp · Photos from Unsplash</p>
          <p className="mt-1 text-rose-300">&quot;Lan xin cảm ơn bạn đã dùng LanScout!&quot; (Lan thanks you for using LanScout!) 🧧</p>
        </footer>
      </body>
    </html>
  );
}
