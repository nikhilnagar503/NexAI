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
import { useCommunities, useCommunityGoals } from "@/hooks/use-communities";
import { useCurrentUser } from "@/hooks/use-users";
import { BotIcon, LockIcon } from "lucide-react";
import { startTransition, useEffect, useState } from "react";

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState<"goals" | "matches">("goals");
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    null
  );
  const {
    data: communities,
    isLoading: isLoadingCommunities,
    error: errorCommunities,
  } = useCommunities();

  const {
    data: communityGoals,
    isLoading: isLoadingCommunityGoals,
    error: errorCommunityGoals,
  } = useCommunityGoals(selectedCommunity);

  useEffect(() => {
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
