import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "temp-mailbox | Free Temporary Email Address",
  description:
    "Generate a free disposable email instantly. Protect your privacy, avoid spam, and receive emails securely.",
  keywords: [
    "temporary email",
    "disposable email",
    "fake email generator",
    "temp mail",
  ],
  openGraph: {
    title: "temp-mailbox | Free Temporary Email Address",
    description: "Instant disposable email – no registration required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* ✅ OneTag Script */}
        <Script id="onetag" strategy="afterInteractive">
          {`
            (function(s){
              s.dataset.zone='10928791';
              s.src='https://al5sm.com/tag.min.js';
            })(
              [document.documentElement, document.body]
                .filter(Boolean)
                .pop()
                .appendChild(document.createElement('script'))
            );
          `}
        </Script>

        {/* ✅ Second Ad Script */}
        <Script
          src="https://quge5.com/88/tag.min.js"
          strategy="afterInteractive"
          data-zone="233784"
          data-cfasync="false"
        />
      </body>
    </html>
  );
}