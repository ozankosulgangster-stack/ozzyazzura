// Compatibility names for existing pages; identity now comes only from a verified session.
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export const getChatGPTUser = getUser;
export async function requireChatGPTUser(returnTo: string) {
  const user = await getUser();
  if (user) return user;
  redirect(chatGPTSignInPath(returnTo));
}
function safePath(value: string) {
  const url = new URL(value, "https://app.local");
  return url.origin === "https://app.local" ? url.pathname + url.search : "/";
}
export function chatGPTSignInPath(returnTo: string) { return `/api/auth/signin?callbackUrl=${encodeURIComponent(safePath(returnTo))}`; }
export function chatGPTSignOutPath(returnTo = "/") { return `/api/auth/signout?callbackUrl=${encodeURIComponent(safePath(returnTo))}`; }
