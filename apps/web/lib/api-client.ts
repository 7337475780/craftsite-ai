const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthHeaders(existingHeaders: any = {}) {
  const headers: any = {
    "Content-Type": "application/json",
    ...existingHeaders,
  };
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("craftsite_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse(response: Response) {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { success: false, message: text || "Invalid JSON response" };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function apiGet(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "omit", // We don't need cookies anymore
  });
  return handleResponse(response);
}

export async function apiPost(endpoint: string, body?: any) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "omit",
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(response);
}

export async function apiPatch(endpoint: string, body?: any) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "omit",
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(response);
}

export async function apiDelete(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "omit",
  });
  return handleResponse(response);
}

/**
 * Public GET — no credentials sent.
 * Use for unauthenticated public endpoints like /api/public/projects/:slug.
 */
export async function apiGetPublic(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse(response);
}
