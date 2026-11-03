import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback } from "react";
import { toast } from "sonner";

import { aiModerate } from "@/lib/moderation.functions";

/** Asks the AI moderator to review an item. The server only acts when the item is hidden. */
export function useAiReview() {
  const moderate = useServerFn(aiModerate);
  const qc = useQueryClient();
  return useCallback(async (kind: "post" | "comment", id: string) => {
    try {
      const res = await moderate({ data: { kind, id } });
      if (res.decision === "remove") toast.info(`The AI moderator kept this ${kind} hidden. A moderator can reverse this.`);
      if (res.decision) await qc.invalidateQueries({ queryKey: ["community"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI review failed. It stays hidden until reviewed.");
    }
  }, [moderate, qc]);
}
