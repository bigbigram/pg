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
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 fixed w-full top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-white">RMA Pay</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    } px-4 py-2 rounded-md text-base font-medium transition-colors duration-150 whitespace-nowrap`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {/* Notifications button */}
              <button className="relative p-2 text-blue-100 hover:bg-blue-700 hover:text-white rounded-full">
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                <BellIcon className="h-5 w-5" />
              </button>

              {/* User menu */}
              {status === 'authenticated' ? (
                <div className="relative group">
                  <button 
                    className="flex items-center text-sm text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-colors duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center mr-2">
                      <span className="text-sm font-medium text-white">
                        {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:inline-block mr-1">
                      {session?.user?.email?.split('@')[0]}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                  </button>
                  
                  {/* Dropdown menu */}
                  <div 
                    ref={userMenuRef}
                    className={`${isUserMenuOpen ? 'block' : 'hidden'} absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50`}
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
                  className="text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${
                isActive(item.href)
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              } group flex items-center px-3 py-2 text-base font-medium rounded-md`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          {status === 'authenticated' ? (
            <div className="pt-4 border-t border-blue-700">
              <div className="flex items-center px-3 py-2">
                <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-white">
                    {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-sm text-white">
                  <div className="font-medium">{session?.user?.email}</div>
                  <div className="text-blue-200 text-xs">
                    {session?.user?.role === 'ADMIN' ? 'Administrator' : 'User'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center px-3 py-2 text-base font-medium text-blue-100 hover:bg-blue-700 hover:text-white rounded-md"
              >
                <LogOutIcon className="mr-2 h-5 w-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
