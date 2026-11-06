export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ResetPassword from "@/app/pages/public/ResetPassword";

export default async function resetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] w-full flex justify-center items-center p-4">
          <p className="text-sm">Loading...</p>
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
}
