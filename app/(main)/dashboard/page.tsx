"use client";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { client } from "@/lib/api-client";
import { MessageCircleIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/stats-card";

export default function DashboardPage() {
 const { user, isLoaded, isSignedIn } = useUser();
 const {
  data: userCommunities,
  isLoading,
  isError,
  error,
 } = useQuery({
  queryKey: ["communities", user?.id],
  queryFn: async () => {
      const res = await client.api.communities.$get();
      if (!res.ok) {
        const bodyText = await res.text();
        throw new Error(`Failed to fetch communities (${res.status}): ${bodyText}`);
      }
      return res.json();
    },
  enabled: isLoaded && isSignedIn,

  });


if (!isLoaded) return <div>Loading...</div>;
if (!isSignedIn) return <div>Please sign in to view your dashboard.</div>;
if (isLoading) return <div>Loading...</div>;
if (isError) return <div>Error: {error?.message}</div>;   

return (
  <div className="page-wrapper">
    <div>
     <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome Back {user?.firstName || "User"}!</p>
    </div>
    
    <Card  className="border-primary">
        <CardHeader>
          <CardTitle>
            🎉 You have  3 matches 
          </CardTitle>
          <CardDescription>
            Review and accept your matches to start chatting
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link href="/chat">
            <Button>Review Matches</Button>
          </Link>
        </CardContent>
        
    </Card>

    <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Your Communities"
          // value={userCommunities?.length || 0}
          value={0}
        />
        <StatsCard 
        title="Learning Goals" 
        // value={learningGoals?.length || 0} 
        value={0}
         />
        <StatsCard
          title="Active Matches"
          // value={activeMatchesData?.length || 0}
          value={ 0}
        />
        <StatsCard
          title="Pending Matches"
          // value={pendingMatchesData?.length || 0}
          value={0}
        />
      </div>


      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageCircleIcon className="size-4 mr-2 text-primary" />
                Recent Chats
              </CardTitle>
              <Link href="/chat">
                <Button variant="outline" size="sm">
                  <UsersIcon className="size-4 mr-2 text-primary" />
                   View All
                </Button>
              </Link>
            </div>
            <CardDescription>Conversations you&apos;re part of</CardDescription>
          </CardHeader>

         
        </Card>


        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <UsersIcon className="size-4 mr-2 text-primary" />
                Communities
              </CardTitle>
              <Link href="/communities">
                <Button variant="outline" size="sm">
                  <UsersIcon className="size-4 mr-2 text-primary" />
                  Manage
                </Button>
              </Link>
            </div>
            <CardDescription>Communities you&apos;re part of</CardDescription>
          </CardHeader>


           <CardContent>
            <div className="space-y-3">
              {/* {userCommunities?.map((community) => (
                <Card className="shadow-none" key={community.id}>
                  <Link href={`/communities/${community.id}`}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {community.community.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {community.community.description}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              ))} */}
            </div>
          </CardContent>
          
        </Card>
      </div>
  </div>
);

}