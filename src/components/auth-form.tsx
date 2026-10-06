import { Link } from "@tanstack/react-router";
import { Check, LockKeyhole, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const isRegister = mode === "register";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
            This demonstration uses mock authentication. Your entries are not sent or stored.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor={`${mode}-email`}>Email address</Label>
              <div className="relative">
                <Mail aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={`${mode}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@clinic.ch"
                  required
                  maxLength={254}
                  className="h-11 pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${mode}-password`}>Password</Label>
              <div className="relative">
                <LockKeyhole aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={`${mode}-password`}
                  name="password"
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  maxLength={128}
                  className="h-11 pl-10"
                />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full">
              {isRegister ? "Register" : "Log in"}
            </Button>
          </form>

          {submitted && (
            <p role="status" className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground">
              Mock authentication complete. No account or data was created.
            </p>
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
        <p className="text-sm font-semibold text-primary">{isRegister ? "Getting started" : "Secure demonstration"}</p>
        <h2 className="mt-3 text-3xl font-semibold text-foreground">
          {isRegister ? "How to sign up" : "A clear, private starting point"}
        </h2>
        {isRegister ? (
          <ol className="mt-8 space-y-6">
            {["Use your professional email address.", "Choose a password with at least eight characters.", "Select Register to enter the mock experience."].map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{index + 1}</span>
                <p className="pt-1 text-sm leading-6 text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-8 flex gap-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Check aria-hidden="true" className="size-4" /></span>
            <p className="pt-1 text-sm leading-6 text-muted-foreground">Use any valid email format and an eight-character password to explore this demonstration.</p>
          </div>
        )}
        <p className="mt-10 border-t border-border pt-6 text-sm font-medium text-foreground">MedBridge does not store patient data.</p>
      </aside>
    </main>
  );
}