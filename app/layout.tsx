import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "LanScout 🥖 — Your Global Property Scout",
  description: "Lan is your globe-trotting property scout — searching cities worldwide with cultural insights, local food tips, events, and weather.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LanScout",
    startupImage: [
      {
        url: "/icons/apple-touch-icon.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#C8281A",
    "msapplication-TileImage": "/icons/icon-144.png",
    "msapplication-tap-highlight": "no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#C8281A" },
    { media: "(prefers-color-scheme: dark)", color: "#5C1F0A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* iOS PWA full-screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LanScout" />
        {/* iOS splash / touch icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128.png" />
        {/* Standard icon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Windows */}
        <meta name="msapplication-TileColor" content="#C8281A" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: '#FDF7EE' }}>
        <Navigation />
        {/* pb-20 on mobile reserves space for fixed bottom tab bar */}
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
        <footer className="hidden sm:block text-center py-6 text-xs text-gray-400 border-t mt-8" style={{ borderColor: '#F5E6D3', background: '#FFF9F0' }}>
          <p>🥖 LanScout is a search tool only — always verify listings with a licensed real estate agent!</p>
          <p className="mt-1">Listings from Realtor.com · Weather from OpenWeatherMap · Events from Ticketmaster · Dining from Yelp · Photos from Unsplash</p>
          <p className="mt-1" style={{ color: '#C8281A' }}>Thanks for using LanScout! 🥖</p>
        </footer>
        <PWAInstallPrompt />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}

// Client component rendered inline — avoids a separate file for this small widget
function PWAInstallPrompt() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    var banner = document.getElementById('lan-install-banner');
    if (banner) banner.style.display = 'flex';
  });
  window.addEventListener('appinstalled', function() {
    var banner = document.getElementById('lan-install-banner');
    if (banner) banner.style.display = 'none';
  });
  window._lanInstall = function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(r) {
        deferredPrompt = null;
        var banner = document.getElementById('lan-install-banner');
        if (banner) banner.style.display = 'none';
      });
    }
  };
  window._lanDismissInstall = function() {
    var banner = document.getElementById('lan-install-banner');
    if (banner) banner.style.display = 'none';
    sessionStorage.setItem('lan-install-dismissed', '1');
  };
  // Don't show if already dismissed this session
  if (sessionStorage.getItem('lan-install-dismissed')) return;
  // Inject the banner HTML into body after load
  document.addEventListener('DOMContentLoaded', function() {
    var div = document.createElement('div');
    div.id = 'lan-install-banner';
    div.style.cssText = 'display:none;position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;background:linear-gradient(135deg,#C8281A,#5C1F0A);color:white;border-radius:20px;padding:12px 16px;box-shadow:0 8px 32px rgba(200,40,26,0.4);align-items:center;gap:12px;max-width:360px;width:calc(100% - 32px);font-family:system-ui,sans-serif;';
    div.innerHTML = '<span style="font-size:24px">🌸</span><div style="flex:1"><div style="font-weight:700;font-size:14px">Install LanScout</div><div style="font-size:12px;opacity:0.85">Add Lan to your home screen!</div></div><button onclick="window._lanInstall()" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);color:white;padding:6px 14px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap">Install</button><button onclick="window._lanDismissInstall()" style="background:none;border:none;color:rgba(255,255,255,0.6);font-size:18px;cursor:pointer;padding:0 4px;line-height:1">&times;</button>';
    document.body.appendChild(div);
  });
})();
        `,
      }}
    />
  );
}
