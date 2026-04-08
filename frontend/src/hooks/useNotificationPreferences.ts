import { NotificationPreferences, ToastAppearance, NotificationTriggers } from '../backend';

// System defaults for new users
export const DEFAULT_TRIGGERS: NotificationTriggers = {
  lakeArrivalAlert: true,
  campfireInvitation: true,
  messageReceived: true,
  eventReminder: true,
  lakeLocationUpdate: true,
  departureWarning: true,
};

export const DEFAULT_APPEARANCE: ToastAppearance = {
  position: 'top-right',
  style: 'default',
  animation: 'fade',
};

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  triggers: DEFAULT_TRIGGERS,
  appearance: DEFAULT_APPEARANCE,
};

// Normalize backend preferences (handle Optional fields)
export function normalizePreferences(
  backendPrefs: NotificationPreferences | null | undefined
): NotificationPreferences {
  if (!backendPrefs) {
    return DEFAULT_PREFERENCES;
  }

  return {
    triggers: {
      lakeArrivalAlert: backendPrefs.triggers?.lakeArrivalAlert ?? DEFAULT_TRIGGERS.lakeArrivalAlert,
      campfireInvitation: backendPrefs.triggers?.campfireInvitation ?? DEFAULT_TRIGGERS.campfireInvitation,
      messageReceived: backendPrefs.triggers?.messageReceived ?? DEFAULT_TRIGGERS.messageReceived,
      eventReminder: backendPrefs.triggers?.eventReminder ?? DEFAULT_TRIGGERS.eventReminder,
      lakeLocationUpdate: backendPrefs.triggers?.lakeLocationUpdate ?? DEFAULT_TRIGGERS.lakeLocationUpdate,
      departureWarning: backendPrefs.triggers?.departureWarning ?? DEFAULT_TRIGGERS.departureWarning,
    },
    appearance: {
      position: backendPrefs.appearance?.position ?? DEFAULT_APPEARANCE.position,
      style: backendPrefs.appearance?.style ?? DEFAULT_APPEARANCE.style,
      animation: backendPrefs.appearance?.animation ?? DEFAULT_APPEARANCE.animation,
    },
  };
}

// Position options for UI
export const POSITION_OPTIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

// Style options for UI
export const STYLE_OPTIONS = [
  { value: 'default', label: 'Default', description: 'Standard notification style' },
  { value: 'subtle', label: 'Subtle', description: 'Minimal, less intrusive' },
  { value: 'prominent', label: 'Prominent', description: 'Bold and attention-grabbing' },
];

// Trigger labels and descriptions
export const TRIGGER_INFO = {
  lakeArrivalAlert: {
    label: 'Lake Arrival Alerts',
    description: 'Notify when campers update their status to "At the Lake"',
  },
  campfireInvitation: {
    label: 'Campfire Invitations',
    description: 'Notify about new campfire events',
  },
  messageReceived: {
    label: 'New Messages',
    description: 'Notify when new chat messages are posted',
  },
  eventReminder: {
    label: 'Event Reminders',
    description: 'Remind about upcoming campfire events within 1 hour',
  },
  lakeLocationUpdate: {
    label: 'Lake Location Updates',
    description: 'Notify about new or updated lake location events',
  },
  departureWarning: {
    label: 'Departure Warnings',
    description: 'Warn when approaching checkout time (2 hours before)',
  },
};
