import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { authMiddleware } from "./middleware/auth-middleware";
import { generateAISummaries, getLatestConversationSummary } from "@/lib/ai";

type Variables = {
  userId: string;
};

const conversationsApp = new Hono<{ Variables: Variables }>()
  .use("/*", authMiddleware)
  .get("/:conversationId/messages", async (c) => {
    const conversationId = c.req.param("conversationId");

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    return c.json(conversationMessages);
  })
  .post("/:conversationId/messages", async (c) => {
    const conversationId = c.req.param("conversationId");
    const user = c.get("user");

    const { content } = await c.req.json();

    const [message] = await db
      .insert(messages)
      .values({
        conversationId,
        content,
        senderId: user.id,
      })
      .returning();

    //update the conversation last message time

    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    return c.json(message);
  })
  .post("/:conversationId/summarize", async (c) => {
    const conversationId = c.req.param("conversationId");

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    const summary = await generateAISummaries(
      conversationId,
      conversationMessages
    );

    return c.json(summary);
  })
  .get("/:conversationId/summary", async (c) => {
    const conversationId = c.req.param("conversationId");
    const summary = await getLatestConversationSummary(conversationId);
    return c.json(summary);
  });
export { conversationsApp };
