import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Heart, Stethoscope, Users, BarChart3, Search, Menu, X } from "lucide-react";

interface HeaderProps {
  currentRole: 'patient' | 'pharmacy' | 'admin';
  onRoleChange: (role: 'patient' | 'pharmacy' | 'admin') => void;
}

export const Header = ({ currentRole, onRoleChange }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const roles = [
    { id: 'patient' as const, label: 'Patient', icon: Heart },
    { id: 'pharmacy' as const, label: 'Pharmacy', icon: Stethoscope },
    { id: 'admin' as const, label: 'Admin', icon: BarChart3 },
  ];

  return (
    <header className="bg-gradient-medical shadow-medical sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary-foreground/20 p-2 rounded-xl">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                RHMS
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                Rural Healthcare Management
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {roles.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentRole === id ? "secondary" : "ghost"}
                onClick={() => onRoleChange(id)}
                className={`
                  flex items-center space-x-2 transition-smooth
                  ${currentRole === id 
                    ? "bg-primary-foreground text-primary shadow-card" 
                    : "text-primary-foreground hover:bg-primary-foreground/10"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Button>
            ))}
            
            <Badge variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
              Rural Health Portal
            </Badge>
            
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/20">
            <div className="space-y-2">
              {roles.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={currentRole === id ? "secondary" : "ghost"}
                  onClick={() => {
                    onRoleChange(id);
                    setIsMenuOpen(false);
                  }}
                  className={`
                    w-full justify-start flex items-center space-x-2 transition-smooth
                    ${currentRole === id 
                      ? "bg-primary-foreground text-primary" 
                      : "text-primary-foreground hover:bg-primary-foreground/10"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
              
              <div className="pt-4 border-t border-primary-foreground/20">
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};