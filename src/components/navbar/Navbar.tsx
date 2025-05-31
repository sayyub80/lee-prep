'use client'

import { useState } from 'react';
import Link from 'next/link';

import { Menu, X, Globe, Mic, BookOpen, Users, Crown, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    { name: 'Practice', path: '/practice', icon: <Mic className="w-4 h-4 mr-2" /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { name: 'Community', path: '/community', icon: <Users className="w-4 h-4 mr-2" /> },
  ];

  return (
    <header className="px-25 py-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">
          Lee Prep
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="flex items-center text-foreground/70 hover:text-primary transition-colors"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link href='/login'>
          <Button variant="outline" size="sm">
            Login
          </Button>
          </Link>
         <Link href='/subscription'>
          <Button size="sm">
            <Crown className="w-4 h-4 mr-2" />
            Go Premium
          </Button>
         </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b p-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="flex items-center text-foreground/70 hover:text-primary transition-colors"
                  onClick={toggleMenu}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Button variant="outline" size="sm">
                  Login
                </Button>
                <Button size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Go Premium
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;