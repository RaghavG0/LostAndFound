"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearUser, getStoredUser } from "@/lib/auth";
import {
  Package,
  PlusCircle,
  ClipboardList,
  LogOut,
  Sparkles,
} from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      pathname === path
        ? "gradient-warm text-primary-foreground shadow-warm"
        : "text-foreground/60 hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/items"
            className="flex items-center gap-2.5 font-bold font-display text-lg"
          >
            <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-gradient">BITS L&F</span>
          </Link>

          {user && (
            <div className="flex items-center gap-1">
              <Link href="/items" className={linkClass("/items")}>
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Items</span>
              </Link>

              <Link href="/add-item" className={linkClass("/add-item")}>
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
              </Link>

              <Link href="/claims" className={linkClass("/claims")}>
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Claims</span>
              </Link>

              <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

              <span className="text-xs text-muted-foreground hidden md:block max-w-[140px] truncate">
                {user.email.split("@")[0]}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
