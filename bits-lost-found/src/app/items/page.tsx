"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getItems, type Item, type FilterParams } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Filters from "@/components/Filters";
import ItemCard from "@/components/ItemCard";
import { useToast } from "@/hooks/use-toast";
import { Package, Inbox } from "lucide-react";

export default function ItemsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterParams>({});

  // 🔒 Protect route
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
    }
  }, [router]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getItems(filters);
      setItems(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="page-container">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-warm">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            Found Items
          </h1>

          <p className="text-muted-foreground text-sm ml-[52px]">
            Browse items found around campus. Spot yours? Claim it!
          </p>
        </div>

        {/* Filters */}
        <Filters onFilterChange={setFilters} />

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="glass-card rounded-2xl overflow-hidden animate-pulse-warm"
              >
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded-lg w-3/4" />
                  <div className="h-4 bg-muted rounded-lg w-full" />
                  <div className="h-4 bg-muted rounded-lg w-1/2" />
                  <div className="h-10 bg-muted rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Inbox className="w-10 h-10 text-muted-foreground/40" />
            </div>

            <p className="text-lg font-display font-semibold text-foreground mb-1">
              No items found
            </p>

            <p className="text-muted-foreground text-sm">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, index) => (
              <div
                key={item.item_id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ItemCard
                  item={item}
                  onRefresh={fetchItems}  // 🔥 clean refresh after claim
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}