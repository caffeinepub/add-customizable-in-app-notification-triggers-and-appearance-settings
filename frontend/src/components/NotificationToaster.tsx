import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { useGetNotificationPreferences } from '../hooks/useQueries';
import { normalizePreferences } from '../hooks/useNotificationPreferences';

export default function NotificationToaster() {
  const { data: prefsData } = useGetNotificationPreferences();
  const prefs = normalizePreferences(prefsData);

  // Map position string to Sonner position type
  const position = prefs.appearance.position as 
    | 'top-left' 
    | 'top-center' 
    | 'top-right' 
    | 'bottom-left' 
    | 'bottom-center' 
    | 'bottom-right';

  return <SonnerToaster position={position} />;
}
