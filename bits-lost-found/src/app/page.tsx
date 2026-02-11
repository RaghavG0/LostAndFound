"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { MapPin, Package, Shield } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/items");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Animated background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 animate-blob" />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 animate-blob"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-primary/3 animate-blob"
        style={{ animationDelay: "4s" }}
      />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Hero */}
        <div className="mb-10 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl gradient-warm flex items-center justify-center mx-auto mb-8 shadow-warm animate-float">
            <Package className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-display mb-3 leading-tight">
            <span className="text-gradient">Lost & Found</span>
          </h1>
          <p className="text-lg font-display font-medium text-foreground/80 mb-2">
            BITS Pilani, Hyderabad
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Found something? Report it. Lost something? Find it here.
            Your campus community helping each other.
          </p>
        </div>

        {/* Login card */}
        <div
          className="glass-card rounded-2xl p-8 mb-8 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-6 font-display">
            Sign in with your BITS email
          </h2>
          <GoogleLoginButton />
        </div>

        {/* Feature pills */}
        <div
          className="flex flex-wrap justify-center gap-3 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            <MapPin className="w-3 h-3 text-primary" />
            Campus-wide
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            <Shield className="w-3 h-3 text-primary" />
            BITS-only access
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
            <Package className="w-3 h-3 text-primary" />
            Easy claiming
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/60 mt-10 font-mono tracking-wide">
          DBMS PROJECT · POSTGRESQL · FASTAPI · NEXTJS
        </p>
      </div>
    </div>
  );
}
