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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    item_name: "",
    description: "",
    category_id: "",
    location: "",
    date_found: "",
    phone_number: "",
    room_number: "",
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

    if (
      !form.item_name ||
      !form.category_id ||
      !form.location ||
      !form.date_found ||
      !form.phone_number ||
      !form.room_number
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("item_name", form.item_name);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("date_found", form.date_found);
      formData.append("category_id", form.category_id);
      formData.append("user_id", String(user.user_id));
      formData.append("phone_number", form.phone_number);
      formData.append("room_number", form.room_number);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await addItem(formData);

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
          {/* Item Name */}
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

          {/* Description */}
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

          {/* Category + Date */}
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

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Location <span className="text-primary">*</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="input-styled"
              placeholder="e.g., Library, F Block"
            />
          </div>

          {/* Reporter Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Your Phone Number <span className="text-primary">*</span>
              </label>
              <input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="input-styled"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Pickup Room Number <span className="text-primary">*</span>
              </label>
              <input
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                className="input-styled"
                placeholder="A-102"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Upload Image (JPG or PNG only)
            </label>
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={(e) => {
                if (e.target.files) {
                  setImageFile(e.target.files[0]);
                }
              }}
              className="input-styled"
            />
          </div>

          {/* Submit */}
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