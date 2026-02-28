"use client";

import { useState } from "react";
import { type Item, claimItem } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Tag, ArrowRight } from "lucide-react";

interface ItemCardProps {
  item: Item;
  onRefresh?: () => void;
}

const ItemCard = ({ item, onRefresh }: ItemCardProps) => {
  const { toast } = useToast();
  const user = getStoredUser();

  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [claimForm, setClaimForm] = useState({
    id_number: "",
    room_number: "",
    phone_number: "",
  });

  const handleClaimSubmit = async () => {
    if (!user) return;

    if (
      !claimForm.id_number ||
      !claimForm.room_number ||
      !claimForm.phone_number
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill all claim details.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      await claimItem({
        item_id: item.item_id,
        user_id: user.user_id,
        id_number: claimForm.id_number,
        room_number: claimForm.room_number,
        phone_number: claimForm.phone_number,
      });

      toast({
        title: "Claim successful 🎉",
        description: "Collect your item within 7 days.",
      });

      setShowModal(false);
      setClaimForm({
        id_number: "",
        room_number: "",
        phone_number: "",
      });

      if (onRefresh) onRefresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to claim item.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isClaimed = (item as any).status === "CLAIMED";

  return (
    <>
      {/* ================= CARD ================= */}
      <div className="group glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
        {/* Image Section */}
        <div className="aspect-[4/3] bg-muted overflow-hidden relative">
          <img
            src={
              item.image_url
                ? `${process.env.NEXT_PUBLIC_API_BASE}${item.image_url}`
                : "/placeholder.svg"
            }
            alt={item.item_name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => item.image_url && setPreview(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-card/90 backdrop-blur-sm text-foreground border border-border">
              <Tag className="w-3 h-3 text-primary" />
              {item.category_name || "Unknown"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-bold text-foreground mb-1.5 line-clamp-1 text-lg">
            {item.item_name}
          </h3>

          {item.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Location + Date */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              {item.location_found}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary/70" />
              {item.date_found}
            </span>
          </div>

          {/* Reporter Info */}
          <div className="text-xs text-muted-foreground mb-5 border-t pt-3">
            <p>
              <strong>Reported by:</strong> {item.reporter_name}
            </p>
            <p>
              <strong>Pickup Room:</strong> {item.reporter_room}
            </p>
            <p>
              <strong>Phone:</strong> {item.reporter_phone}
            </p>
          </div>

          {/* Claim Button */}
          <button
            onClick={() => setShowModal(true)}
            disabled={isClaimed}
            className={`w-full btn-primary flex items-center justify-center gap-2 group/btn ${
              isClaimed ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isClaimed ? "Already Claimed" : "Claim This Item"}
            {!isClaimed && (
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* ================= CLAIM MODAL ================= */}
      {showModal && !isClaimed && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-[400px] space-y-4 shadow-2xl border border-border">
            <h2 className="font-bold text-lg">Claim Item</h2>

            <input
              placeholder="ID Number"
              className="input-styled"
              value={claimForm.id_number}
              onChange={(e) =>
                setClaimForm({ ...claimForm, id_number: e.target.value })
              }
            />

            <input
              placeholder="Room Number"
              className="input-styled"
              value={claimForm.room_number}
              onChange={(e) =>
                setClaimForm({ ...claimForm, room_number: e.target.value })
              }
            />

            <input
              placeholder="Phone Number"
              className="input-styled"
              value={claimForm.phone_number}
              onChange={(e) =>
                setClaimForm({ ...claimForm, phone_number: e.target.value })
              }
            />

            <div className="flex gap-2 pt-2">
              <button
                className="w-full btn-primary"
                onClick={handleClaimSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Claim"}
              </button>

              <button
                className="w-full bg-muted rounded-xl"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= IMAGE PREVIEW ================= */}
      {preview && item.image_url && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreview(false)}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_API_BASE}${item.image_url}`}
            className="max-h-[90vh] max-w-[90vw] rounded-xl"
          />
        </div>
      )}
    </>
  );
};

export default ItemCard;