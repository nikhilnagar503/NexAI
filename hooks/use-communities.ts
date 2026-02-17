import { client } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCommunities = () => {    // useCommunities is a custom hook that fetches the communities the user is part of, using React Query for data fetching and caching.
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

export const useAllCommunities = () => {  // useAllCommunities is a custom hook that fetches all available communities, regardless of the user's membership status, using React Query for data fetching and caching.
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

export const useCommunityGoals = (communityId: string | null) => {    // useCommunityGoals is a custom hook that fetches the learning goals for a specific community, using React Query for data fetching and caching. It takes a communityId as a parameter and only runs the query if the communityId is provided.
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

export const useJoinCommunity = () => {       // useJoinCommunity is a custom hook that provides a mutation function to join a community. It uses React Query's useMutation to handle the API call and state management for the mutation. On success, it invalidates the "communities" query to refetch the updated list of communities.    
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
