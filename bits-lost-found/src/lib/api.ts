const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!;
if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE is not defined");
}

/* =========================
   TYPES
========================= */

export interface Item {
  item_id: number;
  item_name: string;
  description: string | null;
  location_found: string;
  date_found: string;
  image_url: string | null;
  category_name: string;
  reporter_name?: string;
  reporter_phone?: string | null;
  reporter_room?: string | null;
}

export interface ActiveClaim {
  claim_id: number;               // ✅ IMPORTANT
  item_name: string;
  image_url: string | null;
  name: string;
  id_number: string;
  room_number: string;
  phone_number: string;
  claim_date: string;
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

/* =========================
   AUTH
========================= */

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

/* =========================
   ITEMS
========================= */

export async function getItems(
  filters: FilterParams = {}
): Promise<Item[]> {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.days) params.set("days", String(filters.days));
  if (filters.location) params.set("location", filters.location);
  if (filters.search) params.set("search", filters.search);

  const query = params.toString();
  const res = await fetch(
    `${BASE_URL}/api/items${query ? `?${query}` : ""}`
  );

  if (!res.ok) throw new Error("Failed to fetch items");

  return res.json();
}

export async function addItem(formData: FormData): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/items`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to add item");
  }
}

/* =========================
   CLAIMS
========================= */

export async function claimItem(data: {
  item_id: number;
  user_id: number;
  id_number: string;
  room_number: string;
  phone_number: string;
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to claim item");
}

export async function getActiveClaims(): Promise<ActiveClaim[]> {
  const res = await fetch(`${BASE_URL}/api/claims`);

  if (!res.ok) throw new Error("Failed to fetch active claims");

  return res.json();
}

/* =========================
   STATIC CATEGORIES
========================= */

export const CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "ID Cards" },
  { id: 3, name: "Wearables" },
  { id: 4, name: "Jewellery" },
  { id: 5, name: "Books" },
  { id: 6, name: "Miscellaneous" },
];

export async function getMyClaims(userId: number) {
  const res = await fetch(`${BASE_URL}/api/claims/my/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch my claims");
  return res.json();
}

export async function removeClaim(claimId: number) {
  const res = await fetch(`${BASE_URL}/api/claims/${claimId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to remove claim");
}