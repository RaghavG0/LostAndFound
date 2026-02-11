"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveClaims, type ActiveClaim } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Calendar, User, CreditCard, Inbox } from "lucide-react";

export default function ClaimsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [claims, setClaims] = useState<ActiveClaim[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-warm">
              <ClipboardList className="w-5 h-5 text-primary-foreground" />
            </div>
            Active Claims
          </h1>

          <p className="text-muted-foreground text-sm ml-[52px]">
            Items that have been claimed and are pending pickup.
          </p>
        </div>

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
              No active claims
            </p>

            <p className="text-muted-foreground text-sm">
              All clear! No pending claims at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {/* Desktop table */}
            <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Claimed By
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      ID Type
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      ID Number
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Expiry
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {claims.map((claim, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors animate-slide-up"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-foreground">
                        {claim.item_name}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-primary/70" />
                          {claim.name}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-primary/70" />
                          {claim.id_type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-mono text-foreground">
                        {claim.id_number}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary/70" />
                          {claim.expiry_date}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {claims.map((claim, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl p-5 animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <h3 className="font-display font-bold text-foreground mb-3">
                    {claim.item_name}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="w-3.5 h-3.5 text-primary/70" />
                      {claim.name}
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CreditCard className="w-3.5 h-3.5 text-primary/70" />
                      {claim.id_type}
                    </div>

                    <div className="font-mono text-foreground">
                      {claim.id_number}
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary/70" />
                      {claim.expiry_date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
