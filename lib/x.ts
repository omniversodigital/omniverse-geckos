export async function xGet(path: string, accessToken: string, params?: Record<string, any>) {
  const url = new URL(`https://api.x.com${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  
  const response = await fetch(url.toString(), {
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`X GET ${path} ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function xPost(path: string, accessToken: string, body?: any) {
  const options: RequestInit = {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${accessToken}`, 
      "Content-Type": "application/json" 
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`https://api.x.com${path}`, options);
  
  if (!response.ok) {
    throw new Error(`X POST ${path} ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}