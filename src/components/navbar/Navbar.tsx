'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Globe, Mic, BookOpen, Users, Crown, LayoutDashboard, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2 text-sky-500" /> },
    { name: 'Practice', path: '/practice', icon: <Mic className="w-4 h-4 mr-2 text-indigo-500" /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen className="w-4 h-4 mr-2 text-rose-500" /> },
    { name: 'Community', path: '/community', icon: <Users className="w-4 h-4 mr-2 text-emerald-500" /> },
  ];

  return (
    <header className="px-25 py-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Lee Prep</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user?.role === 'admin' && (
            <Link href="/admin" className="flex items-center text-primary hover:text-primary/80 transition-colors font-semibold">
                <Shield className="w-4 h-4 mr-2 text-primary" />
                Admin Panel
            </Link>
          )}

          {menuItems
            .filter(item => user?.role !== 'admin' || item.name !== 'Dashboard')
            .map((item) => (
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

        {/* ... (rest of the component remains the same) ... */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/subscription">
                <Button className='cursor-pointer'size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  {user.subscription?.plan === 'pro' ? 'Pro Member' : 'Go Premium'}
                </Button>
              </Link>
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                >
                  <span className="font-medium">{user.name}</span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 text-sm text-foreground border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-accent text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            !loading && (
              <>
                <Link href='/login'>
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile Menu */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b p-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              {user?.role === 'admin' && (
                  <Link href="/admin" className="flex items-center text-primary hover:text-primary/80 transition-colors font-semibold" onClick={toggleMenu}>
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                  </Link>
              )}
              {menuItems
                .filter(item => user?.role !== 'admin' || item.name !== 'Dashboard')
                .map((item) => (
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
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 px-2 py-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className=" w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 cursor-pointer h-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="text-sm px-2 py-1 hover:bg-accent rounded"
                      onClick={toggleMenu}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/subscription"
                      className="  text-sm px-2 py-1 hover:bg-accent rounded flex items-center"
                      onClick={toggleMenu}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {user.subscription?.plan === 'pro' ? 'Pro Member' : 'Go Premium'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm px-2 py-1 hover:bg-accent rounded text-left text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  !loading && (
                    <>
                      <Link href="/login" onClick={toggleMenu}>
                        <Button variant="outline" size="sm" className="cursor-pointer w-full">
                          Login
                        </Button>
                      </Link>
                      <Link  href="/subscription" onClick={toggleMenu}>
                        <Button   size="sm" className=" w-full cursor-pointer">
                          <Crown className="w-4 h-4 mr-2" />
                          Go Premium
                        </Button>
                      </Link>
                    </>
                  )
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;