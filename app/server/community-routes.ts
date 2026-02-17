import { db } from "@/db";
import { communities, communityMembers, learningGoals } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { get } from "http";
// import { getUserIdFromClerkId } from "./user-routes";
import { client } from "@/lib/api-client";
import { getOrCreateUserByClerkId } from "@/lib/user-utils";

type Variables = {
  userId: string;
};

const communitiesApp = new Hono<{ Variables: Variables }>()
 
  .get("/all", async (c) => {
    const allCommunities = await db.select().from(communities);
    return c.json(allCommunities);
  })
  
  .get("/", async (c) => {
    const clirkid = c.get("userId");
    console.log("clerkid", clirkid);
    const  user = await getOrCreateUserByClerkId(clirkid);

    if(!user){
      return c.json({error: "User not found"}, 404);
    }
    

    const userCommunities = await db
      .select({
        id: communityMembers.id,
        userId: communityMembers.userId,
        communityId: communityMembers.communityId,
        joinedAt: communityMembers.joinedAt,
        community: communities,
      })
      .from(communityMembers)
      .innerJoin(communities, eq(communityMembers.communityId, communities.id))
      .where(eq(communityMembers.userId, user.id));

    return c.json(userCommunities);
  })
 


export { communitiesApp };
