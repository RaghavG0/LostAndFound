"use client";

import { useEffect, useRef } from "react";
import { googleLogin } from "@/lib/api";
import { storeUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;


const GoogleLoginButton = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            const user = await googleLogin(response.credential);

            storeUser(user);

            toast({
              title: "Welcome! 🎉",
              description: `Signed in as ${user.email}`,
            });

            router.push("/items");
          } catch (err) {
            toast({
              title: "Login failed",
              description:
                err instanceof Error
                  ? err.message
                  : "Only BITS Hyderabad emails allowed.",
              variant: "destructive",
            });
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 300,
      });
    };

    if (window.google) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, [router, toast]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={buttonRef} />
      <p className="text-xs text-muted-foreground">
        Only{" "}
        <span className="font-mono font-medium text-foreground/70">
          @hyderabad.bits-pilani.ac.in
        </span>{" "}
        emails
      </p>
    </div>
  );
};

export default GoogleLoginButton;
