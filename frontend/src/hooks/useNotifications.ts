import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useGetMessages, useGetCampfireEvents, useGetLakeLocationEvents, useGetNotificationPreferences } from './useQueries';
import { normalizePreferences } from './useNotificationPreferences';
import { MessageSquare, Flame, MapPin, Bell } from 'lucide-react';

// Helper to get icon and styling based on category
const getNotificationStyle = (category: 'message' | 'campfire' | 'location' | 'reminder', style: string) => {
  const icons = {
    message: MessageSquare,
    campfire: Flame,
    location: MapPin,
    reminder: Bell,
  };

  const colors = {
    message: 'text-blue-600',
    campfire: 'text-orange-600',
    location: 'text-green-600',
    reminder: 'text-purple-600',
  };

  const Icon = icons[category];
  const color = colors[category];

  return { Icon, color };
};

// Custom notification function that respects appearance settings
export function useNotificationSystem() {
  const { data: prefsData } = useGetNotificationPreferences();
  const prefs = normalizePreferences(prefsData);

  const notify = (
    category: 'message' | 'campfire' | 'location' | 'reminder',
    title: string,
    description?: string
  ) => {
    const { Icon, color } = getNotificationStyle(category, prefs.appearance.style);
    
    const isSubtle = prefs.appearance.style === 'subtle';
    const isProminent = prefs.appearance.style === 'prominent';

    toast(title, {
      description,
      icon: React.createElement(Icon, { className: `w-5 h-5 ${color}` }),
      duration: isProminent ? 6000 : isSubtle ? 3000 : 4000,
      className: isProminent ? 'border-2 shadow-lg' : isSubtle ? 'opacity-90' : '',
    });
  };

  return { notify, preferences: prefs };
}

// Watcher hook that monitors for notification-worthy events
export function useNotificationWatcher() {
  const { data: messages = [] } = useGetMessages();
  const { data: campfireEvents = [] } = useGetCampfireEvents();
  const { data: lakeLocationEvents = [] } = useGetLakeLocationEvents();
  const { notify, preferences } = useNotificationSystem();

  // Track previous state to detect new items
  const prevMessagesRef = useRef<number>(0);
  const prevCampfireEventsRef = useRef<number>(0);
  const prevLakeLocationEventsRef = useRef<number>(0);
  const notifiedCampfireEventsRef = useRef<Set<string>>(new Set());

  // Get current user name from localStorage
  const currentUserName = localStorage.getItem('camperName') || '';

  // Watch for new messages
  useEffect(() => {
    if (!preferences.triggers.messageReceived) return;

    const currentCount = messages.length;
    const prevCount = prevMessagesRef.current;

    if (prevCount > 0 && currentCount > prevCount) {
      const newMessages = messages.slice(prevCount);
      // Only notify for messages from other users
      const otherUserMessages = newMessages.filter(msg => msg.sender !== currentUserName);
      
      if (otherUserMessages.length > 0) {
        const latestMessage = otherUserMessages[otherUserMessages.length - 1];
        notify(
          'message',
          `New message from ${latestMessage.sender}`,
          latestMessage.content.substring(0, 50) + (latestMessage.content.length > 50 ? '...' : '')
        );
      }
    }

    prevMessagesRef.current = currentCount;
  }, [messages, preferences.triggers.messageReceived, notify, currentUserName]);

  // Watch for new campfire events
  useEffect(() => {
    if (!preferences.triggers.campfireInvitation) return;

    const currentCount = campfireEvents.length;
    const prevCount = prevCampfireEventsRef.current;

    if (prevCount > 0 && currentCount > prevCount) {
      const newEvents = campfireEvents.slice(prevCount);
      // Only notify for events created by other users
      const otherUserEvents = newEvents.filter(event => event.organizer !== currentUserName);
      
      if (otherUserEvents.length > 0) {
        const latestEvent = otherUserEvents[otherUserEvents.length - 1];
        const eventDate = new Date(Number(latestEvent.date) / 1000000);
        notify(
          'campfire',
          `New campfire event by ${latestEvent.organizer}`,
          `${eventDate.toLocaleDateString()} at ${latestEvent.time} - Site ${latestEvent.campsiteNumber}`
        );
      }
    }

    prevCampfireEventsRef.current = currentCount;
  }, [campfireEvents, preferences.triggers.campfireInvitation, notify, currentUserName]);

  // Watch for new lake location events
  useEffect(() => {
    if (!preferences.triggers.lakeLocationUpdate) return;

    const currentCount = lakeLocationEvents.length;
    const prevCount = prevLakeLocationEventsRef.current;

    if (prevCount > 0 && currentCount > prevCount) {
      const newEvents = lakeLocationEvents.slice(prevCount);
      // Only notify for events created by other users
      const otherUserEvents = newEvents.filter(event => event.organizer !== currentUserName);
      
      if (otherUserEvents.length > 0) {
        const latestEvent = otherUserEvents[otherUserEvents.length - 1];
        const locationName = latestEvent.location.toString().replace(/([A-Z])/g, ' $1').trim();
        notify(
          'location',
          `${latestEvent.organizer} is at ${locationName}`,
          `Time: ${latestEvent.time}`
        );
      }
    }

    prevLakeLocationEventsRef.current = currentCount;
  }, [lakeLocationEvents, preferences.triggers.lakeLocationUpdate, notify, currentUserName]);

  // Watch for upcoming campfire events (event reminders)
  useEffect(() => {
    if (!preferences.triggers.eventReminder) return;

    const now = Date.now();
    const oneHourFromNow = now + (60 * 60 * 1000);

    campfireEvents.forEach(event => {
      const eventTime = Number(event.date) / 1000000;
      const eventId = `${event.organizer}-${event.date}`;

      // Check if event is within 1 hour and we haven't notified yet
      if (eventTime > now && eventTime <= oneHourFromNow && !notifiedCampfireEventsRef.current.has(eventId)) {
        notifiedCampfireEventsRef.current.add(eventId);
        notify(
          'reminder',
          'Campfire event starting soon!',
          `${event.organizer}'s campfire at ${event.time} - Site ${event.campsiteNumber}`
        );
      }
    });
  }, [campfireEvents, preferences.triggers.eventReminder, notify]);
}
