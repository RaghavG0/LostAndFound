"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveClaims, type ActiveClaim } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import {
  ClipboardList,
  Calendar,
  User,
  Phone,
  Home,
  Inbox,
  Hash,
} from "lucide-react";

export default function ClaimsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [claims, setClaims] = useState<ActiveClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 🔒 Protect route
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await getActiveClaims();
        setClaims(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load claims.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="page-container">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-warm">
              <ClipboardList className="w-5 h-5 text-primary-foreground" />
            </div>
            All Claims (Last 30 Days)
          </h1>

          <p className="text-muted-foreground text-sm ml-[52px]">
            All claimed items for the past one month.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="glass-card rounded-2xl p-8 animate-pulse-warm">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Inbox className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-display font-semibold text-foreground mb-1">
              No claims found
            </p>
            <p className="text-muted-foreground text-sm">
              Nothing claimed in the past 30 days.
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-4 text-xs text-muted-foreground uppercase text-left">
                    Claim ID
                  </th>
                  <th className="px-5 py-4 text-xs text-muted-foreground uppercase text-left">
                    Item
                  </th>
                  <th className="px-5 py-4 text-xs text-muted-foreground uppercase text-left">
                    Claimed By
                  </th>
                  <th className="px-5 py-4 text-xs text-muted-foreground uppercase text-left">
                    ID Number
                  </th>
                  <th className="px-5 py-4 text-xs text-muted-foreground uppercase text-left">
                    Room
                  </th>
                  <th className="px-5 py-4 text-xs text-muted-foreground uppercase text-left">
                    Phone
                  </th>
                  <th className="px-5 py-4 text-xs text-muted-foreground uppercase text-left">
                    Claim Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {claims.map((claim) => (
                  <tr
                    key={claim.claim_id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-mono text-primary">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {claim.claim_id}
                      </span>
                    </td>

                    <td
                      className="px-5 py-4 text-sm font-semibold text-primary cursor-pointer hover:underline"
                      onClick={() =>
                        setSelectedImage(claim.image_url || null)
                      }
                    >
                      {claim.item_name}
                    </td>

                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      <User className="inline w-3.5 h-3.5 mr-1" />
                      {claim.name}
                    </td>

                    <td className="px-5 py-4 text-sm font-mono text-foreground">
                      {claim.id_number}
                    </td>

                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      <Home className="inline w-3.5 h-3.5 mr-1" />
                      {claim.room_number}
                    </td>

                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      <Phone className="inline w-3.5 h-3.5 mr-1" />
                      {claim.phone_number}
                    </td>

                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      <Calendar className="inline w-3.5 h-3.5 mr-1" />
                      {claim.claim_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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