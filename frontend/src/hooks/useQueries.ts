import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Camper, Message, Time, ArrivalStatus, CampfireEvent, LakeLocationEvent, UserProfile, LakeLocation, NotificationPreferences } from '../backend';

export function useGetCampers() {
  const { actor, isFetching } = useActor();

  return useQuery<Camper[]>({
    queryKey: ['campers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCampers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOrUpdateCamper() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ name, plannedArrival, plannedDeparture, siteNumber, numberOfCampers }: { name: string; plannedArrival: Time | null; plannedDeparture: Time | null; siteNumber: string | null; numberOfCampers: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrUpdateCamper(name, plannedArrival, plannedDeparture, siteNumber, numberOfCampers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campers'] });
    },
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ name, status }: { name: string; status: ArrivalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStatus(name, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campers'] });
    },
  });
}

export function useUpdatePlannedDeparture() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ name, plannedDeparture }: { name: string; plannedDeparture: Time | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePlannedDeparture(name, plannedDeparture);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campers'] });
    },
  });
}

export function useUpdateSiteNumber() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ name, siteNumber }: { name: string; siteNumber: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSiteNumber(name, siteNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campers'] });
    },
  });
}

export function useUpdateNumberOfCampers() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ name, numberOfCampers }: { name: string; numberOfCampers: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNumberOfCampers(name, numberOfCampers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campers'] });
    },
  });
}

export function useClearCamper() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearCamper(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campers'] });
    },
  });
}

export function useGetMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time feel
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ sender, content }: { sender: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(sender, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCampfireEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<CampfireEvent[]>({
    queryKey: ['campfireEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCampfireEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCampfireEvent() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ organizer, date, time, campsiteNumber }: { organizer: string; date: Time; time: string; campsiteNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCampfireEvent(organizer, date, time, campsiteNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campfireEvents'] });
    },
  });
}

export function useUpdateCampfireEvent() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ organizer, date, time, campsiteNumber }: { organizer: string; date: Time; time: string; campsiteNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCampfireEvent(organizer, date, time, campsiteNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campfireEvents'] });
    },
  });
}

export function useDeleteCampfireEvent() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (eventId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCampfireEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campfireEvents'] });
    },
  });
}

export function useGetLakeLocationEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<LakeLocationEvent[]>({
    queryKey: ['lakeLocationEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLakeLocationEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLakeLocationEvent() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ organizer, time, location }: { organizer: string; time: string; location: LakeLocation }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLakeLocationEvent(organizer, time, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lakeLocationEvents'] });
    },
  });
}

export function useUpdateLakeLocationEvent() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ organizer, time, location }: { organizer: string; time: string; location: LakeLocation }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLakeLocationEvent(organizer, time, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lakeLocationEvents'] });
    },
  });
}

export function useDeleteLakeLocationEvent() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLakeLocationEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lakeLocationEvents'] });
    },
  });
}

// Notification Preferences Hooks
export function useGetNotificationPreferences() {
  const { actor, isFetching } = useActor();

  return useQuery<NotificationPreferences | null>({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerNotificationPreferences();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCallerNotificationPreferences(preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    },
  });
}
