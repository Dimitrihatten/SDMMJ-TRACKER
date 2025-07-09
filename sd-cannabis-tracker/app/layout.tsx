import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SD Cannabis Tracker - Medical Cannabis Patient Portal',
  description: 'Track your medical cannabis allotment, find dispensaries, compare prices, and manage your purchases in South Dakota.',
  keywords: 'South Dakota, medical cannabis, patient tracker, dispensary, allotment, cannabis tracker',
  authors: [{ name: 'Trilly Club LLC' }],
  creator: 'Trilly Club LLC',
  publisher: 'Trilly Club LLC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sdcannabis.com'),
  openGraph: {
    title: 'SD Cannabis Tracker',
    description: 'Your trusted medical cannabis tracking solution in South Dakota',
    url: 'https://sdcannabis.com',
    siteName: 'SD Cannabis Tracker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SD Cannabis Tracker',
    description: 'Track your medical cannabis allotment in South Dakota',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}