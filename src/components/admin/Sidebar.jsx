import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Stethoscope 
} from 'lucide-react';
import { Button } from '../ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from '../ui/sheet';
import { cn } from '../../lib/utils';

const navigationItems = [
  {
    name: 'Dashboards',
    icon: LayoutDashboard,
    href: '/admin/dashboard'
  },
  {
    name: 'Calendar',
    icon: Calendar,
    href: '/admin/calendar'
  },
  {
    name: 'Appointments',
    icon: Stethoscope,
    href: '/admin/appointments'
  },
  {
    name: 'Patients',
    icon: Users,
    href: '/admin/patients'
  }
];

const Sidebar = ({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  children 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href) => {
    navigate(href);
        setMobileMenuOpen(false);
  };

  const DesktopSidebarContent = () => (
    <div className="flex flex-col h-full">
      <nav className="flex-1 py-6 px-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 text-left rounded-md",
                    isActive && "bg-primary text-primary-foreground shadow-sm"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium truncate">{item.name}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full">
      <nav className="flex-1 py-6 px-2 mt-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 text-left rounded-md",
                    isActive && "bg-primary text-primary-foreground shadow-sm"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium truncate">{item.name}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16 md:border-r md:bg-background">
        <div className="flex flex-col flex-1 min-h-0">
          <DesktopSidebarContent />
        </div>
      </aside>

      
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent 
          side="left" 
          className="w-64 p-0 z-50 top-16 h-[calc(100vh-4rem)] pt-4"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>
              Navigate to different sections of the dental center management system.
            </SheetDescription>
          </SheetHeader>
          <MobileSidebarContent />
        </SheetContent>
      </Sheet>

      
      <div className="md:pl-64">
        {children}
      </div>
    </>
  );
};

export default Sidebar; 