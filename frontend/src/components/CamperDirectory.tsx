import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarDays, MapPin, Car, Calendar, Hash, Users, Trash2 } from 'lucide-react';
import { useGetCampers, useClearCamper } from '../hooks/useQueries';
import { ArrivalStatus } from '../backend';

export default function CamperDirectory() {
  const { data: campers, isLoading } = useGetCampers();
  const { mutate: clearCamper, isPending: isClearing } = useClearCamper();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Camper Directory</h2>
        <div className="text-muted-foreground">Loading campers...</div>
      </div>
    );
  }

  if (!campers || campers.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Camper Directory</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No campers registered yet. Be the first to set up your profile!
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const handleClearCamper = (name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the directory?`)) {
      clearCamper(name);
    }
  };

  const getInitial = (name: string) => {
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Camper Directory</h2>
        <p className="text-muted-foreground">See who's planning to visit and who's already here</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campers.map((camper) => (
          <Card key={camper.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                      {getInitial(camper.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {camper.name}
                    </CardTitle>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearCamper(camper.name)}
                  disabled={isClearing}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {getStatusBadge(camper.status)}
                {camper.siteNumber && (
                  <Badge variant="secondary" className="text-xs">
                    <Hash className="w-3 h-3 mr-1" />
                    Site {camper.siteNumber}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {Number(camper.numberOfCampers)} {Number(camper.numberOfCampers) === 1 ? 'camper' : 'campers'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
                  <span>Planned arrival: {formatDate(camper.plannedArrival)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2 shrink-0" />
                  <span>Planned departure: {formatDate(camper.plannedDeparture)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
