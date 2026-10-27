import { Link, useNavigate } from "@tanstack/react-router";
import { BriefcaseMedical, Check, LockKeyhole, Mail, UserRound } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { setStoredRole } from "@/lib/role";

type AuthFormProps = {
  mode: "login" | "register";
};

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});
const patientRegistration = credentials;
const registration = credentials.extend({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  role: z.string().trim().min(1, "Enter your role.").max(60),
});

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [accountRole, setAccountRole] = useState<"provider" | "patient" | null>(null);
  const [challenge, setChallenge] = useState<{ a: number; b: number; start: number } | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("profiles").select("account_role").eq("id", session.user.id).maybeSingle();
      if (cancelled) return;
      // Users without a saved role are treated as providers.
      const role = data?.account_role === "patient" ? "patient" : "provider";
      setStoredRole(role);
      navigate({ to: role === "patient" ? "/patient" : "/dashboard", replace: true });
    })();
    return () => { cancelled = true; };
  }, [session, navigate]);

  useEffect(() => {
    setChallenge({ a: 2 + Math.floor(Math.random() * 7), b: 1 + Math.floor(Math.random() * 8), start: Date.now() });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const form = Object.fromEntries(new FormData(event.currentTarget));
    if (isRegister && !accountRole) {
      setError("Please choose whether you are a healthcare provider or a patient.");
      return;
    }
    const isPatient = isRegister && accountRole === "patient";
    const parsed = (isRegister ? (isPatient ? patientRegistration : registration) : credentials).safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    if (isRegister) {
      const tooFast = !challenge || Date.now() - challenge.start < 3000;
      const wrong = !challenge || Number(form["human"]) !== challenge.a + challenge.b;
      if (form["website"] || tooFast || wrong) {
        setError("We couldn't confirm you're a person. Please answer the check question and try again.");
        return;
      }
    }
    setBusy(true);
    try {
      if (isRegister) {
        const d = parsed.data as Partial<z.infer<typeof registration>> & z.infer<typeof credentials>;
        const { data, error: err } = await supabase.auth.signUp({
          email: d.email,
          password: d.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: isPatient ? { account_role: "patient" } : { display_name: d.name, role: d.role, account_role: "provider" },
          },
        });
        if (err) throw err;
        if (!data.session) setNotice("Check your email and select the confirmation link to finish registering.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword(parsed.data);
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/login" });
    if (result.error) setError("Google sign-in did not complete. Please try again.");
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:px-10 lg:py-24">
      <section className="order-2 lg:order-1">
        <div className="rounded-xl border border-border bg-card p-7 shadow-sm sm:p-10">
          <p className="text-sm font-semibold text-primary">{isRegister ? "Create an account" : "Welcome back"}</p>
          <h1 className="mt-3 text-3xl font-semibold text-card-foreground sm:text-4xl">
            {isRegister ? "Register for MedBridge" : "Log in to MedBridge"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {isRegister ? "Create your account to access Notes, Community and Settings." : "Sign in to access Notes, Community and Settings."}
          </p>

          <Button type="button" variant="outline" size="lg" className="mt-8 w-full" onClick={handleGoogle}>
            Continue with Google
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-foreground">I am… <span className="text-destructive">*</span></legend>
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-required="true">
                  {([["provider", "I am a healthcare provider"], ["patient", "I am a patient"]] as const).map(([value, label]) => (
                    <label key={value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-sm font-medium ${accountRole === value ? "border-primary bg-accent text-foreground" : "border-border text-muted-foreground"}`}>
                      <input type="radio" name="account_role" value={value} required checked={accountRole === value} onChange={() => setAccountRole(value)} className="accent-[var(--primary)]" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {isRegister && accountRole !== "patient" && (
              <>
                <Field id="register-name" name="name" label="Full name" icon={UserRound} autoComplete="name" placeholder="Dr. Anna Keller" maxLength={100} />
                <Field id="register-role" name="role" label="Profession" icon={BriefcaseMedical} autoComplete="organization-title" placeholder="e.g. Nurse, General practitioner" maxLength={60} />
              </>
            )}
            <Field id={`${mode}-email`} name="email" type="email" label="Email address" icon={Mail} autoComplete="email" placeholder="name@clinic.ch" maxLength={254} />
            <Field
              id={`${mode}-password`}
              name="password"
              type="password"
              label="Password"
              icon={LockKeyhole}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
              maxLength={128}
            />
            {isRegister && (
              <>
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="register-website">Website</label>
                  <input id="register-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-human">Quick check: what is {challenge ? `${challenge.a} + ${challenge.b}` : "…"}?</Label>
                  <Input id="register-human" name="human" inputMode="numeric" required maxLength={3} className="h-11" placeholder="Your answer" />
                </div>
              </>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : isRegister ? "Register" : "Log in"}
            </Button>
          </form>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
          )}
          {notice && (
            <p role="status" className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground">{notice}</p>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? "Already registered?" : "New to MedBridge?"}{" "}
            <Link to={isRegister ? "/login" : "/register"} className="font-semibold text-primary hover:underline">
              {isRegister ? "Log in" : "Register"}
            </Link>
          </p>
        </div>
      </section>

      <aside className="order-1 lg:order-2">
        <p className="text-sm font-semibold text-primary">{isRegister ? "Getting started" : "Secure access"}</p>
        <h2 className="mt-3 text-3xl font-semibold text-foreground">
          {isRegister ? "How to sign up" : "A clear, private starting point"}
        </h2>
        {isRegister ? (
          <ol className="mt-8 space-y-6">
            {[
              "Enter your name, your role and your professional email address — or continue with Google.",
              "Choose a password with at least eight characters.",
              "Confirm your email using the link we send you, then log in.",
            ].map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{index + 1}</span>
                <p className="pt-1 text-sm leading-6 text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-8 flex gap-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Check aria-hidden="true" className="size-4" /></span>
            <p className="pt-1 text-sm leading-6 text-muted-foreground">Use the email and password you registered with, or continue with Google.</p>
          </div>
        )}
        <p className="mt-10 border-t border-border pt-6 text-sm font-medium text-foreground">MedBridge does not store patient data.</p>
      </aside>
    </main>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  icon: typeof Mail;
  type?: string;
  autoComplete: string;
  placeholder: string;
  maxLength: number;
};

function Field({ id, name, label, icon: Icon, type = "text", autoComplete, placeholder, maxLength }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} name={name} type={type} autoComplete={autoComplete} placeholder={placeholder} required maxLength={maxLength} className="h-11 pl-10" />
      </div>
    </div>
  );
}
