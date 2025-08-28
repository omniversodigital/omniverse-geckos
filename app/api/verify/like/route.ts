import { getServerSession } from "next-auth";
import { xGet } from "@/lib/x";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    const access = (session as any)?.access_token;
    
    if (!access) {
      return new Response("No auth", { status: 401 });
    }

    const tweetId = process.env.TARGET_TWEET_ID!;
    
    // Get users who liked the tweet
    const likeData = await xGet(`/2/tweets/${tweetId}/liking_users`, access, { 
      "user.fields": "id" 
    });
    
    // Get current user info
    const me = await xGet(`/2/users/me`, access);
    const uid = me?.data?.id;
    
    // Check if current user is in the list of liking users
    const ok = (likeData?.data ?? []).some((u: any) => u.id === uid);
    
    return Response.json({ ok });
  } catch (error) {
    console.error('Like verification failed:', error);
    return Response.json({ ok: false, error: 'Like verification failed' }, { status: 500 });
  }
}