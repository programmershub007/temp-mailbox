import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'temp-mailbox | Free Temporary Email Address',
  description: 'Generate a free disposable email instantly. Protect your privacy, avoid spam, and receive emails securely.',
  keywords: ['temporary email', 'disposable email', 'fake email generator', 'temp mail'],
  openGraph: {
    title: 'temp-mailbox | Free Temporary Email Address',
    description: 'Instant disposable email – no registration required.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><script src="https://quge5.com/88/tag.min.js" data-zone="233784" async data-cfasync="false"></script></head>
      <body>{children}</body>
    </html>
  )
}