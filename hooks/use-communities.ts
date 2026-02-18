import { client } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCommunities = () => {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const res = await client.api.communities.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch communities");
      }
      return res.json();
    },
  });
};

export const useAllCommunities = () => {
  return useQuery({
    queryKey: ["allCommunities"],
    queryFn: async () => {
      const res = await client.api.communities.all.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch all communities");
      }
      return res.json();
    },
  });
};

export const useCommunityGoals = (communityId: string | null) => {
  return useQuery({
    queryKey: ["communityGoals", communityId],
    queryFn: async () => {
      const res = await client.api.communities[":communityId"].goals.$get({
        param: { communityId: communityId! },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch community goals");
      }
      return res.json();
    },
    enabled: !!communityId,
  });
};

export const useCommunityMembers = (communityId: string | null) => {
  return useQuery({
    queryKey: ["communityMembers", communityId],
    queryFn: async () => {
      const res = await fetch(`/api/community-info/${communityId}/members`);
      if (!res.ok) {
        throw new Error("Failed to fetch community members");
      }
      return res.json();
    },
    enabled: !!communityId,
  });
};

export const useCommunityById = (communityId: string | null) => {
  return useQuery({
    queryKey: ["community", communityId],
    queryFn: async () => {
      const res = await fetch(`/api/community-info/${communityId}/details`);
      if (!res.ok) {
        throw new Error("Failed to fetch community details");
      }
      return res.json();
    },
    enabled: !!communityId,
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (communityId: string) => {
      const res = await client.api.communities[":communityId"].join.$post({
        param: { communityId: communityId },
      });
      if (!res.ok) {
        throw new Error("Failed to join community");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
    onError: (error) => {
      console.error("Error joining community", error);
    },
  });
};
