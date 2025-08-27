import { xGet } from './x';

let cache: { id?: string } = {};

export async function resolveTargetId(accessToken: string) {
  if (cache.id) return cache.id;
  
  const username = process.env.OG_USERNAME!;
  const data = await xGet(`/2/users/by/username/${username}`, accessToken, { 
    "user.fields": "id" 
  });
  
  const id = data?.data?.id as string;
  if (!id) {
    throw new Error("No pude resolver el ID de la cuenta objetivo");
  }
  
  cache.id = id;
  return id;
}