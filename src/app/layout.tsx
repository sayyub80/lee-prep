import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ChallengeProvider } from '@/context/ChallangeContext'; 
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'English Learning App',
  description: 'Improve your English speaking skills',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ChallengeProvider> {/* 2. Wrap your components with the provider */}
            <Navbar/>
            {children}
            <Footer />
          </ChallengeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}