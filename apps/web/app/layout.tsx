import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ConditionalNavigation } from '@/components/ConditionalNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Readsy - Sua rede social literária',
  description: 'Conecte-se com outros leitores e compartilhe sua jornada literária.',
  keywords: 'leitura, livros, rede social, literatura, leitores, reviews, resenhas',
  authors: [{ name: 'Readsy Team' }],
  creator: 'Readsy',
  publisher: 'Readsy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Readsy - Sua rede social literária',
    description: 'Conecte-se com outros leitores e compartilhe sua jornada literária.',
    url: 'https://readsy.com',
    siteName: 'Readsy',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Readsy - Rede Social Literária',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Readsy - Sua rede social literária',
    description: 'Conecte-se com outros leitores e compartilhe sua jornada literária.',
    images: ['/images/og-image.png'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#1e293b" />
        <meta name="msapplication-TileColor" content="#1e293b" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen bg-pattern">
                <ConditionalNavigation />
                <main className="animate-fade-in">{children}</main>
              </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#1e293b',
                    border: '1px solid rgba(14, 165, 233, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    backdropFilter: 'blur(8px)',
                  },
                  success: {
                    style: {
                      borderColor: 'rgba(34, 197, 94, 0.3)',
                    },
                  },
                  error: {
                    style: {
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    },
                  },
                }}
              />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 