"use client";

import AddLearningGoal from "@/components/communities/add-learning-goal";   
import AIMatching from "@/components/communities/ai-matching";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCommunities, useCommunityGoals } from "@/hooks/use-communities";   // useCommunities and useCommunityGoals are custom hooks that fetch the communities the user is part of and the learning goals for a specific community, respectively. They use React Query for data fetching and caching.    
import { useCurrentUser } from "@/hooks/use-users";
import { BotIcon, LockIcon } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
 
export default function CommunitiesPage() {   // CommunitiesPage is the main component for the communities page. It manages the state for the active tab (goals or matches), the selected community, and fetches the necessary data using the custom hooks. It also handles the logic for showing the lock icon if the user has reached the limit of communities they can join without a Pro subscription. The component renders a list of communities on the left and either the learning goals or potential learning partners on the right, depending on the active tab.
  const [activeTab, setActiveTab] = useState<"goals" | "matches">("goals");  // activeTab state is used to track which tab is currently active (either "goals" or "matches"). It determines whether to show the learning goals or the potential learning partners in the UI.
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(    // selectedCommunity state is used to track which community is currently selected by the user. It is initially set to null and gets updated when the user clicks on a community from the list. The selected community's ID is then used to fetch the relevant learning goals and potential matches for that community.
    null
  );
  const {
    data: communities,
    isLoading: isLoadingCommunities,
    error: errorCommunities,
  } = useCommunities();  // useCommunities hook is called to fetch the list of communities the user is part of. It returns the data (communities), a loading state (isLoadingCommunities), and an error state (errorCommunities). The data is used to render the list of communities in the UI, while the loading and error states can be used to show appropriate messages or spinners if needed.

  const {
    data: communityGoals,
    isLoading: isLoadingCommunityGoals,
    error: errorCommunityGoals,
  } = useCommunityGoals(selectedCommunity);          // useCommunityGoals hook is called with the selectedCommunity ID to fetch the learning goals for that specific community. It returns the data (communityGoals), a loading state (isLoadingCommunityGoals), and an error state (errorCommunityGoals). The data is used to render the list of learning goals in the UI when the "My Goals" tab is active, while the loading and error states can be used to show appropriate messages or spinners if needed.

  useEffect(() => {   // useEffect is used to automatically select the first community in the list when the communities data is loaded and there is no selected community. This ensures that when the user visits the page, they see the goals for the first community by default without having to click on it. The effect runs whenever the length of the communities array changes, which typically happens when the data is initially loaded.
    if (communities && communities.length > 0 && !selectedCommunity) {
      startTransition(() => {
        setSelectedCommunity(communities[0].community.id);
      });
    }
  }, [communities?.length]);   

  const numberOfCommunities = communities?.length || 0;

  const { data: user } = useCurrentUser();
  const isPro = user?.isPro;

  const showLockIcon = numberOfCommunities >= 3 && !isPro;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showLockIcon && (
              <LockIcon className="size-4 text-muted-foreground" />
            )}{" "}
            Communities
          </CardTitle>
          <CardDescription>{communities?.length} joined</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {communities?.map((c) => (
            <Button
              key={c.community.id}
              className="w-full justify-start"
              onClick={() => {
                setSelectedCommunity(c.community.id);
              }}
              variant={
                selectedCommunity === c.community.id ? "default" : "outline"
              }
            >
              {c.community.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setActiveTab("goals")}
              variant={activeTab === "goals" ? "default" : "outline"}
            >
              My Goals
            </Button>
            <Button
              onClick={() => setActiveTab("matches")}
              variant={activeTab === "matches" ? "default" : "outline"}
            >
              Find Partners with AI
            </Button>
          </div>
          <CardTitle>
            {activeTab === "goals"
              ? "Learning Goals"
              : "Potential Learning Partners"}
          </CardTitle>
          <CardDescription>
            {activeTab === "goals"
              ? `${communityGoals?.length} ${
                  communityGoals?.length === 1 ? "goal" : "goals"
                } in selected community`
              : "Members with similar learning goals"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab === "goals" ? (
            <div className="space-y-2">
              {communityGoals?.map((c) => (
                <Card key={c.id} className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">{c.title}</CardTitle>
                    <CardDescription>{c.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
              <AddLearningGoal
                selectedCommunityId={selectedCommunity!}
                showLockIcon={showLockIcon}
              />
            </div>
          ) : (
            <AIMatching
              totalGoals={communityGoals?.length || 0}
              selectedCommunityId={selectedCommunity!}
              showLockIcon={showLockIcon}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
