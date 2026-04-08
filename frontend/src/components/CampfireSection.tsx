import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Flame, Plus, Calendar as CalendarIcon, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGetCampfireEvents, useCreateCampfireEvent, useUpdateCampfireEvent, useDeleteCampfireEvent, useGetCampers } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { CampfireEvent, Time } from '../backend';

interface CampfireFormData {
  date: Date | undefined;
  time: string;
  campsiteNumber: string;
}

export default function CampfireSection() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampfireEvent | null>(null);
  const [senderName, setSenderName] = useState('');
  const [formData, setFormData] = useState<CampfireFormData>({
    date: undefined,
    time: '',
    campsiteNumber: '',
  });

  const { data: events = [], isLoading: eventsLoading } = useGetCampfireEvents();
  const { data: campers } = useGetCampers();
  const { identity } = useInternetIdentity();
  const createEvent = useCreateCampfireEvent();
  const updateEvent = useUpdateCampfireEvent();
  const deleteEvent = useDeleteCampfireEvent();

  // Load sender name from localStorage (same as ChatSection)
  useEffect(() => {
    const savedName = localStorage.getItem('camperName');
    if (savedName) {
      setSenderName(savedName);
    }
  }, []);

  // Find current camper data
  const currentCamper = campers?.find(camper => camper.name === senderName);

  // Helper function to convert Date to nanoseconds (preserving the date regardless of timezone)
  const dateToNanoseconds = (date: Date): bigint => {
    // Create a new date at noon local time to avoid timezone issues
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    return BigInt(localDate.getTime() * 1_000_000);
  };

  // Helper function to convert nanoseconds to Date (preserving the date regardless of timezone)
  const nanosecondsToDate = (nanoseconds: Time): Date => {
    const date = new Date(Number(nanoseconds) / 1_000_000);
    // Return a date object that represents the same calendar date
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const resetForm = () => {
    setFormData({
      date: undefined,
      time: '',
      campsiteNumber: '',
    });
  };

  const handleCreateEvent = async () => {
    if (!formData.date || !formData.time || !formData.campsiteNumber || !senderName) {
      return;
    }

    try {
      const dateTime = dateToNanoseconds(formData.date);
      await createEvent.mutateAsync({
        organizer: senderName,
        date: dateTime,
        time: formData.time,
        campsiteNumber: formData.campsiteNumber,
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create campfire event:', error);
    }
  };

  const handleEditEvent = async () => {
    if (!formData.date || !formData.time || !formData.campsiteNumber || !editingEvent) {
      return;
    }

    try {
      const dateTime = dateToNanoseconds(formData.date);
      await updateEvent.mutateAsync({
        organizer: editingEvent.organizer,
        date: dateTime,
        time: formData.time,
        campsiteNumber: formData.campsiteNumber,
      });
      
      setIsEditDialogOpen(false);
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update campfire event:', error);
    }
  };

  const handleDeleteEvent = async (event: CampfireEvent) => {
    try {
      // The backend uses Int.abs(date) as the event ID
      const eventId = BigInt(Math.abs(Number(event.date)));
      await deleteEvent.mutateAsync(eventId);
    } catch (error) {
      console.error('Failed to delete campfire event:', error);
    }
  };

  const openEditDialog = (event: CampfireEvent) => {
    setEditingEvent(event);
    setFormData({
      date: nanosecondsToDate(event.date),
      time: event.time,
      campsiteNumber: event.campsiteNumber,
    });
    setIsEditDialogOpen(true);
  };

  const formatEventDate = (date: Time) => {
    const jsDate = new Date(Number(date) / 1_000_000);
    
    // Format date in a way that preserves the intended date
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Use UTC to avoid timezone shifts in display
    };
    
    return jsDate.toLocaleDateString('en-US', options);
  };

  const canManageEvent = (event: CampfireEvent) => {
    return identity && event.owner.toString() === identity.getPrincipal().toString();
  };

  if (!senderName) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Campfire Events</h1>
          <p className="text-muted-foreground">
            Please set up your profile in the Profile section to create and manage campfire events
          </p>
        </div>
        
        {/* Still show existing events even if user hasn't set up profile */}
        <div className="space-y-4">
          {eventsLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Loading campfire events...</p>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                  <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>No Campfire Events Scheduled</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  No campfire events have been scheduled yet. Set up your profile to create the first event!
                </p>
              </CardContent>
            </Card>
          ) : (
            events.map((event, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Campfire by {event.organizer}</CardTitle>
                        <p className="text-sm text-muted-foreground">Organized by {event.organizer}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event)}
                        disabled={deleteEvent.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>Campsite {event.campsiteNumber}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Campfire Events</h1>
        <p className="text-muted-foreground">
          Schedule and join campfire gatherings with fellow campers
        </p>
      </div>

      <div className="flex justify-center">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Campfire
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm border border-border shadow-lg">
            <DialogHeader>
              <DialogTitle>Schedule New Campfire</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-sm border border-border">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="Select time"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campsite">Campsite Number</Label>
                <Input
                  id="campsite"
                  value={formData.campsiteNumber}
                  onChange={(e) => setFormData({ ...formData, campsiteNumber: e.target.value })}
                  placeholder="Enter campsite number"
                />
              </div>

              <Button 
                onClick={handleCreateEvent} 
                className="w-full"
                disabled={!formData.date || !formData.time || !formData.campsiteNumber || createEvent.isPending}
              >
                {createEvent.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-sm border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Campfire Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-sm border border-border">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="Select time"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-campsite">Campsite Number</Label>
              <Input
                id="edit-campsite"
                value={formData.campsiteNumber}
                onChange={(e) => setFormData({ ...formData, campsiteNumber: e.target.value })}
                placeholder="Enter campsite number"
              />
            </div>

            <Button 
              onClick={handleEditEvent} 
              className="w-full"
              disabled={!formData.date || !formData.time || !formData.campsiteNumber || updateEvent.isPending}
            >
              {updateEvent.isPending ? 'Updating...' : 'Update Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {eventsLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Loading campfire events...</p>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>No Campfire Events Scheduled</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Be the first to schedule a campfire gathering! Click the button above to create an event.
              </p>
            </CardContent>
          </Card>
        ) : (
          events.map((event, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Campfire by {event.organizer}</CardTitle>
                      <p className="text-sm text-muted-foreground">Organized by {event.organizer}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {canManageEvent(event) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(event)}
                        disabled={updateEvent.isPending}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event)}
                      disabled={deleteEvent.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{formatEventDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Campsite {event.campsiteNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
