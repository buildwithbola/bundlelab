import type { Metadata, Viewport } from "next";
import "@fontsource/funnel-display/500.css";
import "@fontsource/funnel-display/600.css";
import "@fontsource/funnel-display/700.css";
import "@fontsource/host-grotesk/400.css";
import "@fontsource/host-grotesk/500.css";
import "@fontsource/host-grotesk/600.css";
import "@fontsource/host-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "BundleLab — Interactive Shopify Product Bundle Builder",
  description:
    "Interactive build-your-own-bundle storefront prototype for Shopify OS 2.0 featuring tiered discounts, live tabular savings math, Subscribe & Save stacking, merchant rule configuration, and live /cart/add.js payload inspection.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem('bundlelab-theme');
    var theme = saved === 'dark' || saved === 'light' ? saved : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        style={
          {
            "--font-display": "'Funnel Display'",
            "--font-sans": "'Host Grotesk'",
            "--font-mono": "'JetBrains Mono'",
          } as React.CSSProperties
        }
        className="min-h-screen bg-[var(--bl-bg)] text-[var(--bl-ink)] antialiased selection:bg-[#34D399]/30"
      >
        {children}
      </body>
    </html>
  );
}
