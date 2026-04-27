import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StoryForge',
  description: 'AI-powered cinematic interactive story adventure platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
