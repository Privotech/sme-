import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SME Business Manager',
  description: 'Comprehensive operations manager for small and micro businesses to track sales, point-of-sale (POS), inventory stock alerts, operating expenses, and customer credit ledger.',
  openGraph: {
    title: 'SME Business Manager',
    description: 'Comprehensive operations manager for small and micro businesses to track sales, point-of-sale (POS), inventory stock alerts, operating expenses, and customer credit ledger.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SME Business Manager',
    description: 'Comprehensive operations manager for small and micro businesses to track sales, point-of-sale (POS), inventory stock alerts, operating expenses, and customer credit ledger.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-neutral-50 text-neutral-900 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
