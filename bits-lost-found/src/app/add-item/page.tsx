"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addItem, CATEGORIES } from "@/lib/api";
import { getStoredUser, isLoggedIn } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Send } from "lucide-react";

export default function AddItemPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    item_name: "",
    description: "",
    category_id: "",
    location: "",
    date_found: "",
    image_url: "",
  });

  // 🔒 Protect route
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getStoredUser();
    if (!user) return;

    if (!form.item_name || !form.category_id || !form.location || !form.date_found) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      await addItem({
        item_name: form.item_name,
        description: form.description,
        location: form.location,
        date_found: form.date_found,
        image_url: form.image_url,
        category_id: Number(form.category_id),
        user_id: user.user_id,
      });

      toast({
        title: "Item reported! 📦",
        description: "Thanks for helping someone find their stuff.",
      });

      router.push("/items");
    } catch {
      toast({
        title: "Error",
        description: "Failed to add item.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="page-container max-w-lg">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-warm">
              <PlusCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            Report Found Item
          </h1>

          <p className="text-muted-foreground text-sm ml-[52px]">
            Found something on campus? Help it find its owner.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 sm:p-8 space-y-5 animate-slide-up"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Item Name <span className="text-primary">*</span>
            </label>
            <input
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              className="input-styled"
              placeholder="e.g., Blue Water Bottle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="input-styled resize-none"
              placeholder="Any identifying details..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Category <span className="text-primary">*</span>
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="input-styled"
              >
                <option value="">Select...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date Found <span className="text-primary">*</span>
              </label>
              <input
                name="date_found"
                type="date"
                value={form.date_found}
                onChange={handleChange}
                className="input-styled"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Location <span className="text-primary">*</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="input-styled"
              placeholder="e.g., Library, F Block, LTC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Image URL
            </label>
            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              className="input-styled"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base"
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Item
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
