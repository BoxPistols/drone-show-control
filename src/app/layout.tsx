import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CustomThemeProvider } from '@/lib/theme/ThemeProvider';
import { ApolloProvider } from '@/lib/apollo/ApolloProvider';
import { LayoutProvider } from '@/lib/layout/LayoutContext';
import { AppLayout } from '@/components/layout/AppLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Drone Show Control',
  description: 'Advanced drone show control and management system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloProvider>
          <CustomThemeProvider>
            <LayoutProvider>
              <AppLayout>{children}</AppLayout>
            </LayoutProvider>
          </CustomThemeProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
