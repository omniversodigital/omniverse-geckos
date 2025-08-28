import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Omniverse Geckos - Web3 Gaming Platform',
  description: 'Play, earn, and collect in the ultimate Web3 gaming ecosystem.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}