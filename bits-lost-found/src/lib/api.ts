const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!;
if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE is not defined");
}

export interface Item {
  item_id: number;
  item_name: string;
  description: string | null;
  location_found: string;
  date_found: string;
  image_url: string;
  category_name: string;
}

export interface ActiveClaim {
  item_name: string;
  name: string;
  id_type: string;
  id_number: string;
  expiry_date: string;
}

export interface AuthResponse {
  user_id: number;
  email: string;
}

export interface FilterParams {
  category?: string;
  days?: number;
  location?: string;
  search?: string;
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok)
    throw new Error("Login failed. Only BITS Hyderabad emails allowed.");

  return res.json();
}

export async function getItems(filters: FilterParams = {}): Promise<Item[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.days) params.set("days", String(filters.days));
  if (filters.location) params.set("location", filters.location);
  if (filters.search) params.set("search", filters.search);

  const query = params.toString();
  const res = await fetch(`${BASE_URL}/api/items${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export async function addItem(data: {
  item_name: string;
  description: string;
  location: string;
  date_found: string;
  image_url: string;
  category_id: number;
  user_id: number;
}): Promise<void> {

  const params = new URLSearchParams({
    item_name: data.item_name,
    description: data.description,
    location: data.location,
    date_found: data.date_found,
    image_url: data.image_url,
    category_id: String(data.category_id),
    user_id: String(data.user_id),
  });

  const res = await fetch(`${BASE_URL}/api/items?${params.toString()}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to add item");
}

export async function claimItem(itemId: number, userId: number): Promise<void> {
  const params = new URLSearchParams({
    item_id: String(itemId),
    user_id: String(userId),
  });

  const res = await fetch(`${BASE_URL}/api/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item_id: itemId, user_id: userId })
  });
  if (!res.ok) throw new Error("Failed to claim item");
}

export async function getActiveClaims(): Promise<ActiveClaim[]> {
  const res = await fetch(`${BASE_URL}/api/claims/active`);
  if (!res.ok) throw new Error("Failed to fetch active claims");
  return res.json();
}

// Predefined categories matching the database
export const CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "ID Cards" },
  { id: 3, name: "Wearables" },
  { id: 4, name: "Jewellery" },
  { id: 5, name: "Books" },
  { id: 6, name: "Miscellaneous" },
];

