import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Aithreus", template: "%s · Aithreus" },
  description: "Signal-and-calibration trading analytics + the affiliate Link CMS.",
};

// No-FOUC theme: apply the persisted theme class before paint. Dark is default.
const themeScript = `(function(){try{var t=localStorage.getItem('aithreus-theme');if(!t){var m=document.cookie.match(/aithreus-theme=(light|dark)/);t=m&&m[1];}if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
