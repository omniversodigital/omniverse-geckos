import { getServerSession } from "next-auth";
import { xPost } from "@/lib/x";
import { resolveTargetId } from "@/lib/target";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession();
    const access = (session as any)?.access_token;
    
    if (!access) {
      return new Response("No auth", { status: 401 });
    }

    const uidTarget = await resolveTargetId(access);
    
    // Si ya seguía, X responde igualmente con following:true
    const data = await xPost(`/2/users/me/following`, access, { 
      target_user_id: uidTarget 
    });
    
    const ok = data?.data?.following === true;
    return Response.json({ ok });
  } catch (error) {
    console.error('Follow verification failed:', error);
    return Response.json({ ok: false, error: 'Follow verification failed' }, { status: 500 });
  }
}