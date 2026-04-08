import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Flame, MapPin, MessageCircle, User, ArrowRight } from 'lucide-react';

type ActiveSection = 'home' | 'directory' | 'campfires' | 'locations' | 'chat' | 'profile';

interface HomePageProps {
  onNavigate: (section: ActiveSection) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      title: 'Camper Directory',
      description: 'View all registered campers, their arrival status, site numbers, and planned dates.',
      icon: Users,
      section: 'directory' as ActiveSection,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Campfires',
      description: 'Schedule and join campfire events with fellow campers around the lake.',
      icon: Flame,
      section: 'campfires' as ActiveSection,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Lake Locations',
      description: 'Discover and share favorite spots around Seneca Lake for activities.',
      icon: MapPin,
      section: 'locations' as ActiveSection,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Chat',
      description: 'Connect with other campers through real-time messaging.',
      icon: MessageCircle,
      section: 'chat' as ActiveSection,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Profile',
      description: 'Manage your camping details, arrival status, and site information.',
      icon: User,
      section: 'profile' as ActiveSection,
      color: 'text-teal-600 dark:text-teal-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/assets/IMG_2594.JPG)',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative px-8 py-16 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to The 445 Seneca Lake
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            The 4-4-5 is the talk of the lake! Jen and I welcome you from campsite 445. Use this app to keep everyone informed.
          </p>
          <Button 
            size="lg" 
            onClick={() => onNavigate('profile')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Ready to Connect Section - Moved to top */}
      <Card className="bg-muted/50">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Connect?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start by setting up your profile to let other campers know when you'll be arriving, 
            which site you're staying at, and how many people are in your group. Then explore 
            the directory to see who else is camping and join the conversation in our chat room.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => onNavigate('profile')}>
              Set Up Profile
            </Button>
            <Button variant="outline" onClick={() => onNavigate('directory')}>
              View Campers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card 
              key={feature.section} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onNavigate(feature.section)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center mb-4">
                  {feature.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Explore
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
