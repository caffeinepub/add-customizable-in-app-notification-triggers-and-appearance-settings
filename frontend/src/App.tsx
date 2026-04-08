import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import NotificationToaster from './components/NotificationToaster';
import { useNotificationWatcher } from './hooks/useNotifications';
import Header from './components/Header';
import ChatSection from './components/ChatSection';
import CamperDirectory from './components/CamperDirectory';
import ProfileSection from './components/ProfileSection';
import CampfireSection from './components/CampfireSection';
import LakeLocationSection from './components/LakeLocationSection';
import HomePage from './components/HomePage';
import Footer from './components/Footer';

const queryClient = new QueryClient();

type ActiveSection = 'home' | 'directory' | 'campfires' | 'locations' | 'chat' | 'profile';

function AppContent() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');

  // Mount notification watcher at app level
  useNotificationWatcher();

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage onNavigate={setActiveSection} />;
      case 'directory':
        return <CamperDirectory />;
      case 'campfires':
        return <CampfireSection />;
      case 'locations':
        return <LakeLocationSection />;
      case 'chat':
        return <ChatSection />;
      case 'profile':
        return <ProfileSection />;
      default:
        return <HomePage onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {renderActiveSection()}
      </main>
      <Footer />
      <NotificationToaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
