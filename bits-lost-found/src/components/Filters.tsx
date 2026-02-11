import { useState } from "react";
import { CATEGORIES, type FilterParams } from "@/lib/api";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface FiltersProps {
  onFilterChange: (filters: FilterParams) => void;
}

const Filters = ({ onFilterChange }: FiltersProps) => {
  const [category, setCategory] = useState("");
  const [days, setDays] = useState("");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const hasFilters = category || days || location || search;

  const handleApply = () => {
    onFilterChange({
      category: category || undefined,
      days: days ? Number(days) : undefined,
      location: location || undefined,
      search: search || undefined,
    });
  };

  const handleClear = () => {
    setCategory("");
    setDays("");
    setLocation("");
    setSearch("");
    onFilterChange({});
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleApply();
  };

  return (
    <div className="glass-card rounded-2xl p-5 mb-8 animate-fade-in">
      {/* Search bar - always visible */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for lost items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="input-styled pl-11"
          />
        </div>
        <button onClick={handleApply} className="btn-primary">
          Search
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`btn-secondary flex items-center gap-2 ${expanded ? "bg-primary/10 text-primary" : ""}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Expandable filters */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-styled"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Time Range</label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="input-styled"
              >
                <option value="">All Time</option>
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
              <input
                type="text"
                placeholder="e.g., Library, LTC..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="input-styled"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={handleClear}
              className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters;
