import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

const scopes = [
  "users.read",
  "tweet.read", 
  "offline.access",
  "like.read",
  "follows.write"
].join(" ");

const handler = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.X_CLIENT_ID!,
      clientSecret: process.env.X_CLIENT_SECRET!,
      version: "2.0",
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: { scope: scopes }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.access_token = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).access_token = token.access_token;
      return session;
    }
  }
});

export { handler as GET, handler as POST };