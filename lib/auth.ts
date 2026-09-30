import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  providers: [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" })],
  callbacks: {
    async signIn({ account, profile }) {
      return account?.provider === "google" && (profile as { email_verified?: boolean })?.email_verified === true;
    },
    async jwt({ token, account }) {
      if (account) token.sub = `google:${account.providerAccountId}`;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) (session.user as typeof session.user & { id: string }).id = token.sub;
      return session;
    },
  },
};
export async function getUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id || !user.email) return null;
  return { userId: user.id, email: user.email.toLowerCase(), displayName: user.name || user.email, fullName: user.name ?? null };
}
