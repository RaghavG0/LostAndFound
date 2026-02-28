"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyClaims, removeClaim } from "@/lib/api";
import { getStoredUser, isLoggedIn } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Trash2, Inbox, Hash } from "lucide-react";

interface MyClaim {
  claim_id: number;
  item_name: string;
  image_url: string | null;
  claim_date: string;
  room_number: string;
  phone_number: string;
}

export default function MyClaimsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [claims, setClaims] = useState<MyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const user = getStoredUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
      return;
    }

    if (!user) return;

    const fetchClaims = async () => {
      try {
        const data = await getMyClaims(user.user_id);
        setClaims(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load your claims.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [router, toast, user]);

  const handleRemove = async (claimId: number) => {
    try {
      await removeClaim(claimId);

      toast({
        title: "Claim removed",
        description: "Item is now available again.",
      });

      setClaims((prev) => prev.filter((c) => c.claim_id !== claimId));
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove claim.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="page-container">
        <h1 className="text-3xl font-bold font-display mb-6">
          My Claims
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : claims.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="mx-auto mb-4 w-10 h-10 text-muted-foreground" />
            <p>No claims yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim.claim_id}
                className="glass-card rounded-xl p-5 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold flex items-center gap-2"
                  onClick={() =>
                        setSelectedImage(claim.image_url || null)
                      }>
                    <Hash className="w-4 h-4" />
                    {claim.claim_id} — {claim.item_name}
                  </p>

                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    {claim.claim_date}
                  </p>

                  <p className="text-sm mt-1">
                    Room: {claim.room_number} | Phone: {claim.phone_number}
                  </p>
                </div>

                <button
                  onClick={() => handleRemove(claim.claim_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 relative max-w-lg w-full mx-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-4 text-lg font-bold"
            >
              ✕
            </button>

            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE}${selectedImage}`}
              className="w-full rounded-xl"
              alt="Claimed item"
            />
          </div>
        </div>
      )}
    </div>
  );
}