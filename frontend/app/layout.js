import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Carbonease - Carbon Credit Trading Platform',
  description: 'Professional carbon credit trading platform for buyers and sellers. Trade verified carbon credits from renewable energy projects worldwide.',
  keywords: 'carbon credits, carbon trading, renewable energy, sustainability, climate change, carbon offset',
  authors: [{ name: 'Carbonease Team' }],
  openGraph: {
    title: 'Carbonease - Carbon Credit Trading Platform',
    description: 'Professional carbon credit trading platform for buyers and sellers.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carbonease - Carbon Credit Trading Platform',
    description: 'Professional carbon credit trading platform for buyers and sellers.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
