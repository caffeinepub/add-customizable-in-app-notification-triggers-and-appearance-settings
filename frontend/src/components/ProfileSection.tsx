import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, MapPin, User, Car, Calendar, Hash, Users } from 'lucide-react';
import { useAddOrUpdateCamper, useUpdateStatus, useGetCampers, useUpdateSiteNumber, useUpdateNumberOfCampers } from '../hooks/useQueries';
import { ArrivalStatus } from '../backend';
import { toast } from 'sonner';
import NotificationSettingsCard from './NotificationSettingsCard';

export default function ProfileSection() {
  const [name, setName] = useState('');
  const [plannedArrival, setPlannedArrival] = useState('');
  const [plannedDeparture, setPlannedDeparture] = useState('');
  const [siteNumber, setSiteNumber] = useState('');
  const [numberOfCampers, setNumberOfCampers] = useState('1');
  
  const { data: campers } = useGetCampers();
  const addOrUpdateCamperMutation = useAddOrUpdateCamper();
  const updateStatusMutation = useUpdateStatus();
  const updateSiteNumberMutation = useUpdateSiteNumber();
  const updateNumberOfCampersMutation = useUpdateNumberOfCampers();

  // Load saved name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('camperName');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  // Find current camper data
  const currentCamper = campers?.find(camper => camper.name === name);

  // Helper function to convert date string to nanoseconds (preserving the date regardless of timezone)
  const dateStringToNanoseconds = (dateString: string): bigint | null => {
    if (!dateString) return null;
    
    // Parse the date string as local date (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create date at noon local time to avoid timezone issues
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    
    return BigInt(date.getTime() * 1000000); // Convert to nanoseconds
  };

  // Helper function to convert nanoseconds to date string (preserving the date regardless of timezone)
  const nanosecondsToDateString = (nanoseconds: bigint | undefined): string => {
    if (!nanoseconds) return '';
    
    const date = new Date(Number(nanoseconds) / 1000000);
    
    // Extract year, month, day in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const numCampers = parseInt(numberOfCampers);
    if (isNaN(numCampers) || numCampers < 1) {
      toast.error('Please enter a valid number of campers (minimum 1)');
      return;
    }

    try {
      const arrivalTime = dateStringToNanoseconds(plannedArrival);
      const departureTime = dateStringToNanoseconds(plannedDeparture);
      const siteNumberValue = siteNumber.trim() || null;

      await addOrUpdateCamperMutation.mutateAsync({
        name: name.trim(),
        plannedArrival: arrivalTime,
        plannedDeparture: departureTime,
        siteNumber: siteNumberValue,
        numberOfCampers: BigInt(numCampers),
      });

      // Save name to localStorage
      localStorage.setItem('camperName', name.trim());
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleStatusUpdate = async (status: ArrivalStatus) => {
    if (!name.trim()) {
      toast.error('Please set your name first');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({ name: name.trim(), status });
      
      const statusMessages = {
        [ArrivalStatus.planning]: 'Status updated to Planning',
        [ArrivalStatus.onTheWay]: 'Safe travels! 🚗',
        [ArrivalStatus.atTheLake]: 'Welcome to the lake! 🏕️'
      };
      
      toast.success(statusMessages[status]);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSiteNumberUpdate = async () => {
    if (!name.trim()) {
      toast.error('Please set your name first');
      return;
    }

    try {
      const siteNumberValue = siteNumber.trim() || null;
      await updateSiteNumberMutation.mutateAsync({ 
        name: name.trim(), 
        siteNumber: siteNumberValue 
      });
      
      toast.success('Site number updated successfully!');
    } catch (error) {
      console.error('Failed to update site number:', error);
      toast.error('Failed to update site number');
    }
  };

  const handleNumberOfCampersUpdate = async () => {
    if (!name.trim()) {
      toast.error('Please set your name first');
      return;
    }

    const numCampers = parseInt(numberOfCampers);
    if (isNaN(numCampers) || numCampers < 1) {
      toast.error('Please enter a valid number of campers (minimum 1)');
      return;
    }

    try {
      await updateNumberOfCampersMutation.mutateAsync({ 
        name: name.trim(), 
        numberOfCampers: BigInt(numCampers)
      });
      
      toast.success('Number of campers updated successfully!');
    } catch (error) {
      console.error('Failed to update number of campers:', error);
      toast.error('Failed to update number of campers');
    }
  };

  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'Not set';
    
    const date = new Date(Number(timestamp) / 1000000);
    
    // Format date in a way that preserves the intended date
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Use UTC to avoid timezone shifts in display
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (status: ArrivalStatus) => {
    switch (status) {
      case ArrivalStatus.planning:
        return (
          <Badge variant="outline">
            <CalendarDays className="w-3 h-3 mr-1" />
            Planning
          </Badge>
        );
      case ArrivalStatus.onTheWay:
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            <Car className="w-3 h-3 mr-1" />
            On the way
          </Badge>
        );
      case ArrivalStatus.atTheLake:
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <MapPin className="w-3 h-3 mr-1" />
            At the Lake
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <CalendarDays className="w-3 h-3 mr-1" />
            Planning
          </Badge>
        );
    }
  };

  const getStatusButtonVariant = (status: ArrivalStatus, currentStatus: ArrivalStatus) => {
    return status === currentStatus ? 'default' : 'outline';
  };

  // Load current camper dates into form fields when camper data changes
  useEffect(() => {
    if (currentCamper) {
      setSiteNumber(currentCamper.siteNumber || '');
      setNumberOfCampers(String(Number(currentCamper.numberOfCampers)));
      setPlannedArrival(nanosecondsToDateString(currentCamper.plannedArrival));
      setPlannedDeparture(nanosecondsToDateString(currentCamper.plannedDeparture));
    }
  }, [currentCamper]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your camping information and preferences
        </p>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Profile Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrival">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Planned Arrival
                </Label>
                <Input
                  id="arrival"
                  type="date"
                  value={plannedArrival}
                  onChange={(e) => setPlannedArrival(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="departure">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Planned Departure
                </Label>
                <Input
                  id="departure"
                  type="date"
                  value={plannedDeparture}
                  onChange={(e) => setPlannedDeparture(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Site Number
                </Label>
                <Input
                  id="site"
                  value={siteNumber}
                  onChange={(e) => setSiteNumber(e.target.value)}
                  placeholder="e.g., 445"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="numCampers">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Campers
                </Label>
                <Input
                  id="numCampers"
                  type="number"
                  min="1"
                  value={numberOfCampers}
                  onChange={(e) => setNumberOfCampers(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={addOrUpdateCamperMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {addOrUpdateCamperMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Current Status Card */}
      {currentCamper && (
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(currentCamper.status)}
            </div>

            <Separator />

            <div>
              <Label className="mb-3 block">Update Your Status</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant={getStatusButtonVariant(ArrivalStatus.planning, currentCamper.status)}
                  onClick={() => handleStatusUpdate(ArrivalStatus.planning)}
                  disabled={updateStatusMutation.isPending}
                  className="flex items-center justify-center"
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Planning
                </Button>
                <Button
                  variant={getStatusButtonVariant(ArrivalStatus.onTheWay, currentCamper.status)}
                  onClick={() => handleStatusUpdate(ArrivalStatus.onTheWay)}
                  disabled={updateStatusMutation.isPending}
                  className="flex items-center justify-center"
                >
                  <Car className="w-4 h-4 mr-2" />
                  On the Way
                </Button>
                <Button
                  variant={getStatusButtonVariant(ArrivalStatus.atTheLake, currentCamper.status)}
                  onClick={() => handleStatusUpdate(ArrivalStatus.atTheLake)}
                  disabled={updateStatusMutation.isPending}
                  className="flex items-center justify-center"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  At the Lake
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Arrival Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(currentCamper.plannedArrival)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Departure Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(currentCamper.plannedDeparture)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Site Number</p>
                  <p className="text-sm text-muted-foreground">{currentCamper.siteNumber || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Number of Campers</p>
                  <p className="text-sm text-muted-foreground">{String(Number(currentCamper.numberOfCampers))}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings Card */}
      <NotificationSettingsCard />
    </div>
  );
}
