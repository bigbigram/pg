import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  Menu as MenuIcon,
  X as XIcon,
  LogOut as LogOutIcon,
  User as UserIcon,
  Home as HomeIcon,
  Users as UsersIcon,
  Globe as GlobeIcon,
  CreditCard as CreditCardIcon,
  ChevronDown as ChevronDownIcon,
  Bell as BellIcon
} from 'lucide-react';

// Define the type for navigation items
type NavItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
  requiresAuth?: boolean;
  adminOnly?: boolean;
};

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const isActive = (path: string) => router.pathname === path || 
    (path !== '/' && router.pathname.startsWith(path));

  const navItems: NavItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: <HomeIcon className="mr-2 h-5 w-5" />, 
      requiresAuth: true 
    },
    { 
      name: 'Users', 
      href: '/users', 
      icon: <UsersIcon className="mr-2 h-5 w-5" />, 
      requiresAuth: true, 
      adminOnly: true 
    },
    { 
      name: 'Domains', 
      href: '/domains', 
      icon: <GlobeIcon className="mr-2 h-5 w-5" />, 
      requiresAuth: true, 
      adminOnly: true 
    },
    { 
      name: 'Transactions', 
      href: '/transactions', 
      icon: <CreditCardIcon className="mr-2 h-5 w-5" />, 
      requiresAuth: true 
    },
  ];

  // Don't show header on login page
  if (router.pathname === '/auth/login') {
    return null;
  }
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Filter navigation items based on auth status and admin role
  const filteredNavItems = navItems.filter(item => {
    // If not authenticated, only show public items
    if (status !== 'authenticated') {
      return !item.requiresAuth;
    }
    
    // If adminOnly is true, check if user is admin
    if (item.adminOnly && session?.user?.role !== 'ADMIN') {
      return false;
    }
    
    return true;
  });
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);
  
  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && event.target instanceof Node && 
          !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuRef]);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (status === 'loading') {
    return <div className="bg-blue-600 text-white p-4">Loading user session...</div>;
  }

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-200 ${
      isScrolled 
        ? 'bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg' 
        : 'bg-gradient-to-r from-blue-600 to-blue-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-white tracking-tight hover:text-blue-200 transition-colors">
                RMA Pay
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-blue-700/50 text-white ring-2 ring-blue-400/50'
                        : 'text-blue-100 hover:bg-blue-700/30 hover:text-white'
                    } px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <button className="relative p-2 text-blue-100 hover:bg-blue-700/30 hover:text-white rounded-full transition-colors duration-200">
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <BellIcon className="h-5 w-5" />
              </button>

              {status === 'authenticated' ? (
                <div className="relative group">
                  <button 
                    className="flex items-center text-sm text-white hover:bg-blue-700/30 px-3 py-2 rounded-lg transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-500/50 backdrop-blur-sm flex items-center justify-center mr-2 ring-2 ring-blue-400/50">
                      <span className="text-sm font-medium text-white">
                        {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:inline-block mr-1">
                      {session?.user?.email?.split('@')[0]}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  
                  {/* Update dropdown styles */}
                  <div 
                    ref={userMenuRef}
                    className={`${
                      isUserMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                    } absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 transition-all duration-200`}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-900 font-medium">{session?.user?.email}</p>
                      <p className="text-xs text-gray-500">
                        {session?.user?.role === 'ADMIN' ? 'Administrator' : 'User'}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOutIcon className="mr-2 h-5 w-5" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="text-white bg-blue-500/20 hover:bg-blue-700/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button with improved styling */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-100 hover:text-white focus:outline-none"
              aria-label="Main menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute block h-0.5 w-6 bg-current transform transition duration-200 ease-in-out ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-2'
                }`} />
                <span className={`absolute block h-0.5 w-6 bg-current transform transition duration-200 ease-in-out ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`absolute block h-0.5 w-6 bg-current transform transition duration-200 ease-in-out ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-2'
                }`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu with improved styling */}
      <div className={`fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] md:hidden bg-blue-900/95 backdrop-blur-sm transform transition-all duration-300 ease-in-out shadow-xl ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? 'bg-blue-700/80 text-white'
                    : 'text-blue-100 hover:bg-blue-800/80'
                } flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors`}
              >
                <span className="w-5 h-5 mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {status === 'authenticated' ? (
            <div className="p-3 border-t border-blue-800">
              <div className="flex items-center px-4 py-3 mb-2 bg-blue-800/50 rounded-xl">
                <div className="h-9 w-9 rounded-full bg-blue-700 flex items-center justify-center mr-3 ring-2 ring-blue-400/30">
                  <span className="text-sm font-medium text-white">
                    {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {session?.user?.email}
                  </div>
                  <div className="text-xs text-blue-300">
                    {session?.user?.role === 'ADMIN' ? 'Administrator' : 'User'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/10 rounded-xl"
              >
                <LogOutIcon className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="p-3 border-t border-blue-800">
              <Link
                href="/auth/login"
                className="flex items-center px-4 py-3 text-sm font-medium text-blue-100 hover:bg-blue-800/80 rounded-xl"
              >
                <UserIcon className="mr-3 h-5 w-5" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
