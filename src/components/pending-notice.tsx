import { Clock } from "lucide-react";

import { useCanPost } from "@/lib/community";

/** Shown to accounts that are not yet approved as providers. */
export function PendingNotice() {
  const { data: canPost } = useCanPost();
  if (canPost !== false) return null;
  return (
    <p className="card mb-6 flex items-start gap-2 border-amber/40 bg-amber/10 text-sm text-navy">
      <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
      Your account will be checked before you can post. Until it is approved you can read the Community, but not post, comment or vote.
    </p>
  );
}
