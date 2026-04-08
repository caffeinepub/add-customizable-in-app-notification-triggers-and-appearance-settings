import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Home, Users, Flame, MapPin, MessageCircle, User } from 'lucide-react';

type ActiveSection = 'home' | 'directory' | 'campfires' | 'locations' | 'chat' | 'profile';

interface HeaderProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

export default function Header({ activeSection, onSectionChange }: HeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <nav className="flex space-x-1 overflow-x-auto">
            <Button
              variant={activeSection === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('home')}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button
              variant={activeSection === 'directory' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('directory')}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Directory</span>
            </Button>
            <Button
              variant={activeSection === 'campfires' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('campfires')}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Campfires</span>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeSection === 'locations' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onSectionChange('locations')}
                    className="flex items-center space-x-2 whitespace-nowrap"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Lake Locations</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Please let the group know where you are hanging out at</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant={activeSection === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('chat')}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
            <Button
              variant={activeSection === 'profile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange('profile')}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
