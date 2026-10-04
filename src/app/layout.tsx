import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'CampusSaarthi — Your IIM Lucknow Campus Guide & AI Assistant',
  description:
    'An institutional AI assistant portal for IIM Lucknow students, strictly grounded in official campus circulars, handbook rules, and indoor navigation.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col bg-[#FBF7EF] text-[#3B2E2A] antialiased selection:bg-[#C9A227]/30 selection:text-[#5C1220]">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
