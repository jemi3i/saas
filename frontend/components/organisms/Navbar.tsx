
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, ChevronRight, Search } from 'lucide-react';
import ThemeToggle from '../atoms/ThemeToggle';
import UserMenu from '../molecules/UserMenu';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import NotificationPanel from './NotificationPanel';
import { useNotificationStore } from '../../store/notificationStore';
import BusinessSwitcher from '../molecules/BusinessSwitcher';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="mr-2">
          <BusinessSwitcher />
        </div>

        <nav className="hidden xl:flex items-center text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Nova AI</Link>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;

            return (
              <React.Fragment key={name}>
                <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/50" />
                <Link
                  to={routeTo}
                  className={isLast ? "text-foreground font-semibold" : "hover:text-primary transition-colors capitalize"}
                >
                  {name.replace('-', ' ')}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden lg:block w-48 xl:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Quick search..." className="h-9 pl-9 bg-muted/50 border-none focus-visible:ring-1" />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <ThemeToggle />
          <div className="relative" ref={notifRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </Button>
            {isNotifOpen && <NotificationPanel onClose={() => setIsNotifOpen(false)} />}
          </div>
          <div className="mx-1 h-6 w-px bg-border" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
