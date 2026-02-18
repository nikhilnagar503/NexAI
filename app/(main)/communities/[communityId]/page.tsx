"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCommunityById,
  useCommunityMembers,
} from "@/hooks/use-communities";
import { ArrowLeftIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type CommunityMember = {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string | null;
  };
};

export default function CommunityDetailPage() {
  const { communityId } = useParams<{ communityId: string }>();

  const { data: community } = useCommunityById(communityId);

  const {
    data: members,
    isLoading: isLoadingMembers,
    error: errorMembers,
  } = useCommunityMembers(communityId) as {
    data: CommunityMember[] | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  return (
    <div>
      <Link href="/communities/all">
        <Button variant="outline">
          <ArrowLeftIcon className="size-4" />
          Back to All Communities
        </Button>
      </Link>

      <div className="mt-6 space-y-6">
        {/* Community Header */}
        <div>
          <h2 className="text-2xl font-bold">
            {community?.name || "Community"}
          </h2>
          {community?.description && (
            <p className="text-muted-foreground mt-1">
              {community.description}
            </p>
          )}
        </div>

        {/* Members Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-5" />
              Members
            </CardTitle>
            <CardDescription>
              {isLoadingMembers
                ? "Loading members..."
                : `${members?.length || 0} ${
                    members?.length === 1 ? "member" : "members"
                  } in this community`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMembers ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : errorMembers ? (
              <p className="text-sm text-destructive">
                Failed to load members.
              </p>
            ) : members && members.length > 0 ? (
              <div className="space-y-3">
                {members.map((member: CommunityMember) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <UserAvatar
                      name={member.user.name}
                      imageUrl={member.user.imageUrl ?? undefined}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {member.user.email}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      Joined{" "}
                      {new Date(member.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No members yet. Be the first to join!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
