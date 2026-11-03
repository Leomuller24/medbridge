import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AiDecision = { decision: "remove" | "restore"; reason: string };

const input = z.object({ kind: z.enum(["post", "comment"]), id: z.string().uuid() });

const INSTRUCTIONS = `You moderate MedBridge, a community for Swiss healthcare providers who share communication and cultural-context tips about treating migrant patients.
A post or comment was hidden after 3 user reports. Decide whether to "remove" it or "restore" it.
Remove it if it: contains personal or identifying patient information (names, dates of birth, addresses, case numbers, very specific identifying details); is spam or advertising; is disrespectful, discriminatory or stereotyping toward patients, cultures or colleagues; or gives clearly false or dangerous medical claims presented as fact.
Restore it if it is a respectful, good-faith professional tip, even if people disagree with it.
Give a short, neutral reason (one sentence, under 25 words) that can be shown to users. Never give medical advice.`;

export const aiModerate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data, context }): Promise<{ decision: AiDecision["decision"] | null; reason: string }> => {
    const { data: provider } = await context.supabase.rpc("is_provider", { _user_id: context.userId });
    if (!provider) throw new Error("Only providers can use the community.");
    // The server reads the item itself, and only reviews it when the backend has hidden it (3 reports).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const table = data.kind === "post" ? "community_posts" : "community_answers";
    const col = data.kind === "post" ? "post_id" : "answer_id";
    let text = "";
    let author: string | null = null;
    if (data.kind === "post") {
      const { data: row } = await supabaseAdmin.from("community_posts").select("title, body, status, author_id").eq("id", data.id).maybeSingle();
      if (!row || row.status !== "hidden") return { decision: null, reason: "" };
      text = `${row.title}\n\n${row.body}`; author = row.author_id;
    } else {
      const { data: row } = await supabaseAdmin.from("community_answers").select("body, status, author_id").eq("id", data.id).maybeSingle();
      if (!row || row.status !== "hidden") return { decision: null, reason: "" };
      text = row.body; author = row.author_id;
    }
    const { data: reps } = await supabaseAdmin.from("community_reports").select("reason").eq(col, data.id);
    const result = await askAi(data.kind, text.slice(0, 6000), (reps ?? []).map((r) => r.reason));
    if (result.decision === "remove") await supabaseAdmin.from(table).delete().eq("id", data.id);
    else {
      await supabaseAdmin.from("community_reports").delete().eq(col, data.id);
      await supabaseAdmin.from(table).update({ status: "visible" }).eq("id", data.id);
    }
    await supabaseAdmin.from("community_mod_log").insert({ item_kind: data.kind, item_id: data.id, author_id: author, excerpt: text.slice(0, 200), decision: result.decision, reason: result.reason, decided_by: "ai" });
    return result;
  });

async function askAi(kind: string, text: string, reasons: string[]): Promise<AiDecision> {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI moderation is not configured.");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: INSTRUCTIONS,
        input: `Type: ${kind}\nReport reasons: ${reasons.join(", ") || "none given"}\n\nContent:\n"""${text}"""`,
        text: {
          format: {
            type: "json_schema",
            name: "moderation",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["decision", "reason"],
              properties: { decision: { type: "string", enum: ["remove", "restore"] }, reason: { type: "string" } },
            },
          },
        },
      }),
    });
    if (!res.ok || !res.body) {
      if (res.status === 402) throw new Error("AI moderation is paused: the workspace is out of AI credits.");
      if (res.status === 429) throw new Error("AI moderation is busy. Please try again shortly.");
      throw new Error(`AI moderation failed (${res.status}).`);
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let out = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string };
          if (ev.type === "response.output_text.delta" && ev.delta) out += ev.delta;
        } catch { /* ignore partial */ }
      }
    }
    try {
      const parsed = JSON.parse(out) as AiDecision;
      if (parsed.decision !== "remove" && parsed.decision !== "restore") throw new Error();
      return { decision: parsed.decision, reason: String(parsed.reason).slice(0, 200) };
    } catch {
      throw new Error("AI moderation returned an unreadable answer.");
    }
  }
