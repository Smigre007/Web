"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ClerkAccountSettingsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] w-full justify-center p-4 md:p-8 pb-16">
      <UserProfile
        path="/settings/account"
        routing="path"
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-3xl",
            card: "shadow-none border border-[var(--border-default)]",
          },
        }}
      />
    </div>
  );
}
