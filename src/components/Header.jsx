import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Sun, Moon, Menu, LogOut } from "lucide-react";

const Header = ({ 
  burgerMenu = false, 
  showLogout = true, 
  mobileMenuOpen = false, 
  setMobileMenuOpen = () => {} 
}) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { userLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur z-50 sticky top-0">
      <div className="mx-auto flex items-center justify-between px-4 py-2 md:py-3">
        
        <div className="flex items-center gap-2 min-w-[48px]">
          
          {burgerMenu && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-1"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </Button>
          )}
          
          <div 
            className={`cursor-pointer flex items-center ${burgerMenu ? 'mx-auto md:mx-0' : ''} select-none hover:opacity-80 transition-opacity`}
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/');
              }
            }}
          >
              <span className="font-bold text-lg tracking-tight">X Dental Center</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="ml-2"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          {showLogout && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Logout"
              onClick={userLogout}
              className="ml-1"
            >
              <LogOut size={20} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 