import { auth } from "@clerk/nextjs/server";

import { Hono } from "hono";

type Variables = {
  userId: string;
};

export const userApp = new Hono<{ Variables: Variables }>()
  
  .get("/", async (c) => {

    const { has } = await auth();
    const isPro = has({ plan: "pro_plan" });
    return c.json({

      isPro,
    });
  });
