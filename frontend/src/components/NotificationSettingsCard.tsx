import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Save } from 'lucide-react';
import { useGetNotificationPreferences, useUpdateNotificationPreferences } from '../hooks/useQueries';
import { normalizePreferences, POSITION_OPTIONS, STYLE_OPTIONS, TRIGGER_INFO } from '../hooks/useNotificationPreferences';
import { NotificationPreferences, NotificationTriggers, ToastAppearance } from '../backend';
import { toast } from 'sonner';

export default function NotificationSettingsCard() {
  const { data: prefsData, isLoading } = useGetNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const [triggers, setTriggers] = useState<NotificationTriggers | null>(null);
  const [appearance, setAppearance] = useState<ToastAppearance | null>(null);

  // Load preferences when data is available
  useEffect(() => {
    if (prefsData !== undefined) {
      const normalized = normalizePreferences(prefsData);
      setTriggers(normalized.triggers);
      setAppearance(normalized.appearance);
    }
  }, [prefsData]);

  const handleTriggerToggle = (key: keyof NotificationTriggers) => {
    if (!triggers) return;
    setTriggers({
      ...triggers,
      [key]: !triggers[key],
    });
  };

  const handlePositionChange = (position: string) => {
    if (!appearance) return;
    setAppearance({
      ...appearance,
      position,
    });
  };

  const handleStyleChange = (style: string) => {
    if (!appearance) return;
    setAppearance({
      ...appearance,
      style,
    });
  };

  const handleSave = async () => {
    if (!triggers || !appearance) return;

    const preferences: NotificationPreferences = {
      triggers,
      appearance,
    };

    try {
      await updatePrefs.mutateAsync(preferences);
      toast.success('Notification settings saved successfully!');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save notification settings. Please try again.');
    }
  };

  if (isLoading || !triggers || !appearance) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading notification settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Customize which activities trigger notifications and how they appear
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Triggers */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Notification Triggers</h3>
            <p className="text-sm text-muted-foreground">
              Choose which activities will show notifications
            </p>
          </div>
          <Separator />
          <div className="space-y-4">
            {(Object.keys(TRIGGER_INFO) as Array<keyof NotificationTriggers>).map((key) => (
              <div key={key} className="flex items-start justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor={key} className="text-base font-medium cursor-pointer">
                    {TRIGGER_INFO[key].label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {TRIGGER_INFO[key].description}
                  </p>
                </div>
                <Switch
                  id={key}
                  checked={triggers[key]}
                  onCheckedChange={() => handleTriggerToggle(key)}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Toast Appearance */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Appearance</h3>
            <p className="text-sm text-muted-foreground">
              Customize how notifications look and where they appear
            </p>
          </div>
          <Separator />

          {/* Position */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Position</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {POSITION_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={appearance.position === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePositionChange(option.value)}
                  className="text-sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Visual Style</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {STYLE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={appearance.style === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleChange(option.value)}
                  className="h-auto py-3 flex flex-col items-start text-left"
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={updatePrefs.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {updatePrefs.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
