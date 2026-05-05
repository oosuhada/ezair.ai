import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EZ AIR Next',
  description: 'Next.js fullstack migration scaffold for EZ AIR',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
