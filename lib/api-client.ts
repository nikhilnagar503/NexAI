import { hc } from "hono/client";
import type { AppType } from "@/app/(main)/api/[[...route]]/route";

export const client = hc<AppType>("")
