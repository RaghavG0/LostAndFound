import { type Item, CATEGORIES } from "@/lib/api";
import { MapPin, Calendar, Tag, ArrowRight } from "lucide-react";

interface ItemCardProps {
  item: Item;
  onClaim: (itemId: number) => void;
  claiming?: boolean;
}

const ItemCard = ({ item, onClaim, claiming }: ItemCardProps) => {
  const categoryName = item.category_name || "Unknown";
  return (
    <div className="group glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="aspect-[4/3] bg-muted overflow-hidden relative">
        <img
          src={item.image_url || "/placeholder.svg"}
          alt={item.item_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-card/90 backdrop-blur-sm text-foreground border border-border">
            <Tag className="w-3 h-3 text-primary" />
            {categoryName}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-foreground mb-1.5 line-clamp-1 text-lg">
          {item.item_name}
        </h3>
        {item.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary/70" />
            {item.location_found}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary/70" />
            {item.date_found}
          </span>
        </div>
        <button
          onClick={() => onClaim(item.item_id)}
          disabled={claiming}
          className="w-full btn-primary flex items-center justify-center gap-2 group/btn"
        >
          {claiming ? (
            "Claiming..."
          ) : (
            <>
              Claim This Item
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
