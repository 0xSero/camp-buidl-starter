import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Contracts UI
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/examples/voting" className="hover:text-gray-300">
              Voting
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>© 2023 Contracts UI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
