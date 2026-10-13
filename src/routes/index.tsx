import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle, ArrowRight, BookOpen, Check, Globe, HeartHandshake, HelpCircle, Languages, LogIn,
  MessageCircleMore, NotebookPen, Rocket, Search, ShieldCheck, Sparkles, Stethoscope, UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { ConversationIllustration, FloatingShapes, HandoverIllustration, SearchIllustration, Wave } from "@/components/welcome/illustrations";
import { Counter, Reveal } from "@/components/welcome/motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LANGUAGES, SNOMED_SYMPTOMS } from "@/lib/medbridge-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedBridge — Better conversations with every patient" },
      { name: "description", content: "Cultural and communication context for Swiss healthcare providers supporting migrant patients." },
      { property: "og:title", content: "MedBridge — Better conversations with every patient" },
      { property: "og:description", content: "Cultural and communication context for Swiss healthcare providers supporting migrant patients." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const card = "rounded-[20px] border border-border/70 bg-card shadow-layered";
const iconWrap = "grid size-11 shrink-0 place-items-center rounded-full";

function Label({ children, light }: { children: string; light?: boolean }) {
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", light ? "text-aqua" : "text-primary")}>{children}</p>;
}

function Index() {
  return (
    <div className="bg-background">
      <WelcomeHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Impact />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

/* 1. Sticky glass header */
const LANGS = [
  { code: "EN", flag: "🇬🇧", name: "English" },
  { code: "FR", flag: "🇫🇷", name: "Français" },
  { code: "DE", flag: "🇩🇪", name: "Deutsch" },
  { code: "AR", flag: "🇸🇦", name: "العربية" },
];

function WelcomeHeader() {
  const links = [
    { href: "#how-it-works", label: "How it works", icon: Sparkles },
    { href: "#features", label: "Features", icon: Stethoscope },
    { href: "#community", label: "Community", icon: UsersRound },
    { href: "#privacy", label: "Privacy", icon: ShieldCheck },
  ];
  return (
    <header className="glass sticky top-0 z-50 border-b border-border/60">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link to="/" aria-label="MedBridge home"><Logo /></Link>
        <nav aria-label="Welcome page sections" className="hidden items-center gap-1 lg:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <a key={href} href={href} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-ice hover:text-foreground">
              <Icon aria-hidden="true" className="size-4" /> {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full" aria-label="Interface language"><Globe aria-hidden="true" /> 🇬🇧 EN</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGS.map((l) => (
                <DropdownMenuItem key={l.code} onSelect={() => l.code !== "EN" && toast("Only English is available for now.")}>
                  <span aria-hidden="true">{l.flag}</span> {l.name} {l.code === "EN" && <Check aria-hidden="true" className="ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex"><Link to="/login"><LogIn aria-hidden="true" /> Log in</Link></Button>
          <Button asChild size="sm" className="rounded-full shadow-layered"><Link to="/register"><Rocket aria-hidden="true" /> Get started</Link></Button>
        </div>
      </div>
    </header>
  );
}

/* 2. Hero */
function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-hero text-primary-foreground">
      {/* Soft blurred blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 size-[30rem] rounded-full bg-aqua/20 blur-3xl" />
        <div className="absolute -right-28 top-1/3 size-[26rem] rounded-full bg-teal/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-mint/10 blur-3xl" />
        {/* Faint dot pattern */}
        <div className="absolute inset-0 dots text-primary-foreground/[0.07]" />
      </div>
      <FloatingShapes />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:px-10 lg:pb-32 lg:pt-24">
        <div className="animate-fade-up">
          <span className="glass-dark inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-sm font-medium">
            <span className="size-2 animate-pulse rounded-full bg-aqua" /> Built for Swiss healthcare teams
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-[56px] xl:text-[64px]">
            Better conversations with <span className="text-gradient">every patient</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80">
            MedBridge gives Swiss healthcare providers cultural and communication context when caring for migrant patients — practical translations and guidance, never diagnosis or medical advice.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full bg-aqua px-7 text-navy shadow-layered transition hover:-translate-y-0.5 hover:bg-mint">
              <Link to="/register"><Rocket aria-hidden="true" /> Get started <ArrowRight aria-hidden="true" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass-dark h-12 rounded-full border-primary-foreground/30 px-7 text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-foreground/15 hover:text-primary-foreground">
              <Link to="/login"><LogIn aria-hidden="true" /> Log in</Link>
            </Button>
          </div>
        </div>
        <HeroCards />
      </div>
      <Wave className="absolute inset-x-0 -bottom-px text-background" />
    </section>
  );
}

function HeroCards() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[440px] w-full max-w-md animate-fade-up [animation-delay:200ms] sm:h-[460px]">
      {/* Briefing card */}
      <div style={{ "--tilt": "-3deg" } as React.CSSProperties} className={`${card} absolute left-0 top-6 w-[86%] animate-float p-6 text-card-foreground`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`${iconWrap} size-9 bg-ice text-primary`}><Stethoscope className="size-4" /></span>
            <div>
              <p className="text-xs text-muted-foreground">CASE-A14 · Tigrinya</p>
              <p className="font-display font-bold">Briefing card</p>
            </div>
          </div>
          <span className="rounded-full bg-amber/25 px-2.5 py-0.5 text-xs font-semibold text-navy">Interpreter</span>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-navy">Headache</span>
          <span className="rounded-full bg-ice px-3 py-1 text-xs font-semibold text-navy">Fatigue</span>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">Cultural context</p>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Some patients wait to be asked before sharing details, out of politeness or respect.</p>
        <div className="mt-4 space-y-1.5">
          <div className="h-2 w-full rounded-full bg-ice" />
          <div className="h-2 w-3/4 rounded-full bg-ice" />
        </div>
      </div>
      {/* Chat bubble card */}
      <div style={{ "--tilt": "3deg" } as React.CSSProperties} className={`${card} absolute bottom-10 right-0 w-[72%] animate-float p-5 text-card-foreground [animation-delay:1.2s]`}>
        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><MessageCircleMore className="size-4 text-primary" /> Same sentence, two languages</p>
        <div className="mt-3 space-y-2">
          <p dir="rtl" className="rounded-2xl rounded-tr-sm bg-mint px-3.5 py-2 text-sm text-navy">متى بدأ الألم؟</p>
          <p className="rounded-2xl rounded-tl-sm bg-ice px-3.5 py-2 text-sm text-navy">Quand la douleur a-t-elle commencé ?</p>
        </div>
      </div>
      {/* Stat card */}
      <div style={{ "--tilt": "-2deg" } as React.CSSProperties} className={`${card} absolute bottom-0 left-4 animate-float px-5 py-4 text-card-foreground [animation-delay:2.4s]`}>
        <div className="flex items-center gap-3">
          <span className={`${iconWrap} size-10 bg-aqua/20 text-teal`}><Languages className="size-5" /></span>
          <div>
            <p className="font-display text-2xl font-extrabold">{SNOMED_SYMPTOMS.length}</p>
            <p className="text-xs text-muted-foreground">symptoms covered</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 3. Credibility strip */
/* 4. Features */
const FEATURES = [
  { icon: Languages, title: "Symptom translation", text: "Search 38 SNOMED symptoms by name, everyday words or the patient's language.", tint: "bg-ice text-primary" },
  { icon: UsersRound, title: "Cultural context", text: "Review cultural considerations that may shape communication and expectations.", tint: "bg-mint text-teal" },
  { icon: HeartHandshake, title: "Family perspective", text: "See how relatives may describe what the patient is experiencing at home.", tint: "bg-amber/20 text-navy" },
  { icon: NotebookPen, title: "Shared notes", text: "Keep notes by case and choose which ones to share with colleagues.", tint: "bg-ice text-primary" },
  { icon: AlertTriangle, title: "Red flags", text: "Track communication red flags, like interpreter needs, for each case.", tint: "bg-coral/15 text-coral" },
  { icon: MessageCircleMore, title: "Community", text: "Learn from colleagues' experiences with patients from many backgrounds.", tint: "bg-mint text-teal" },
];

function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 overflow-hidden bg-background py-20 lg:py-28">
      <div aria-hidden="true" className="absolute inset-0 dots text-primary/10" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="max-w-2xl">
          <Label>Features</Label>
          <h2 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">Context for more human care</h2>
          <p className="mt-4 text-lg text-muted-foreground">Use clear translated phrases to support respectful conversations, and approach each interaction with more awareness, clarity and confidence.</p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text, tint }, i) => (
            <Reveal key={title} delay={i * 80}>
              <article className={`${card} group h-full p-7 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl`}>
                <span className={`${iconWrap} ${tint}`}><Icon aria-hidden="true" className="size-5" /></span>
                <h3 className="mt-5 text-lg font-bold text-card-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                <Link to="/register" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Learn more <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 5. How it works */
function HowItWorks() {
  const steps = [
    { title: "Start a case", text: "Select New Case and set the patient's language.", art: SearchIllustration },
    { title: "Build the briefing", text: "Pick symptoms to see a briefing card with context.", art: ConversationIllustration },
    { title: "Save or hand over", text: "Save the card to Notes or print a handover summary.", art: HandoverIllustration },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-ice py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Label>How it works</Label>
          <h2 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">Three steps to a clearer conversation</h2>
        </Reveal>
        <div className="relative mt-16 grid gap-10 md:grid-cols-3">
          <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-7 hidden h-0.5 bg-gradient-to-r from-teal via-aqua to-mint md:block" />
          {steps.map(({ title, text, art: Art }, i) => (
            <Reveal key={title} delay={i * 120} className="relative text-center">
              <span className="relative mx-auto grid size-14 place-items-center rounded-full bg-primary font-display text-xl font-extrabold text-primary-foreground shadow-layered ring-8 ring-ice">{i + 1}</span>
              <div className={`${card} mt-8 p-6`}>
                <div className="mx-auto h-36 max-w-[220px]"><Art /></div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 7. Impact numbers */
function Impact() {
  const stats = [
    { n: LANGUAGES.length, s: "", label: "Patient languages supported", icon: Languages },
    { n: SNOMED_SYMPTOMS.length, s: "", label: "SNOMED symptoms covered", icon: Stethoscope },
    { n: 26, s: "", label: "Cantons", icon: Globe },
    { n: 1200, s: "+", label: "Community members (example)", icon: UsersRound },
  ];
  return (
    <section id="community" className="relative isolate scroll-mt-20 overflow-hidden bg-hero py-20 text-primary-foreground">
      <FloatingShapes />
      <div className="relative mx-auto grid max-w-7xl gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
        {stats.map(({ n, s, label, icon: Icon }, i) => (
          <Reveal key={label} delay={i * 80} className="glass-dark rounded-[20px] border border-primary-foreground/15 p-7">
            <span className={`${iconWrap} bg-aqua/20 text-aqua`}><Icon aria-hidden="true" className="size-5" /></span>
            <p className="mt-5 font-display text-5xl font-extrabold"><Counter to={n} suffix={s} /></p>
            <p className="mt-1 text-sm text-primary-foreground/75">{label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* 9. FAQ + CTA */
const FAQS = [
  { q: "Does MedBridge diagnose or give medical advice?", a: "No. MedBridge is informational and translation-oriented. It offers communication and cultural context only." },
  { q: "Is patient data stored?", a: "MedBridge does not store patient data. Cases and notes stay in your own browser, and you should only ever use case codes." },
  { q: "Which languages are covered?", a: `Briefings can be prepared for ${LANGUAGES.length} patient languages, including Arabic, Tigrinya, Dari and Ukrainian.` },
  { q: "Who can join?", a: "Healthcare providers in Switzerland, including doctors, nurses and interpreters." },
];

function Faq() {
  return (
    <section id="privacy" className="scroll-mt-20 bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:px-10">
        <Reveal>
          <Label>Privacy and FAQ</Label>
          <h2 className="mt-3 text-4xl font-bold text-foreground">Questions, answered</h2>
          <div className={`${card} mt-8 flex gap-4 bg-soft p-6`}>
            <span className={`${iconWrap} bg-card text-teal`}><ShieldCheck aria-hidden="true" className="size-5" /></span>
            <p className="text-sm font-medium leading-6 text-foreground">MedBridge does not store patient data.</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <Accordion type="single" collapsible className={`${card} px-6`}>
            {FAQS.map(({ q, a }) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left font-display text-base font-semibold"><span className="flex items-center gap-3"><HelpCircle aria-hidden="true" className="size-4 shrink-0 text-primary" /> {q}</span></AccordionTrigger>
                <AccordionContent className="pl-7 text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="bg-ice px-5 py-20 sm:px-8 lg:px-10">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-hero p-10 text-center text-primary-foreground shadow-2xl sm:p-16">
        <FloatingShapes />
        <div className="relative">
          <h2 className="text-4xl font-extrabold sm:text-5xl">Ready for your next <span className="text-gradient">conversation</span>?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">Create a free account and prepare your first briefing card in minutes.</p>
          <Button asChild size="lg" className="mt-8 h-14 rounded-full bg-aqua px-10 text-base text-navy shadow-layered transition hover:-translate-y-0.5 hover:bg-mint">
            <Link to="/register"><Rocket aria-hidden="true" /> Get started free <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

/* 10. Footer */
function Footer() {
  const cols = [
    { title: "Product", links: [["#features", "Features"], ["#how-it-works", "How it works"], ["#community", "Community"]] },
    { title: "Account", links: [["/login", "Log in"], ["/register", "Register"]] },
    { title: "Trust", links: [["#privacy", "Privacy"], ["#privacy", "FAQ"]] },
  ];
  return (
    <footer className="bg-navy text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_repeat(4,1fr)] lg:px-10">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/70">Cultural and communication context for Swiss healthcare providers caring for migrant patients.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold">{c.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/70">
              {c.links.map(([href, label]) => <li key={label}><a href={href} className="transition hover:text-aqua">{label}</a></li>)}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold"><BookOpen aria-hidden="true" className="size-4" /> Patient languages</h3>
          <p className="mt-4 text-sm leading-6 text-primary-foreground/70">{LANGUAGES.join(" · ")}</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:justify-between sm:px-8 lg:px-10">
          <p className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-aqua" /> MedBridge does not store patient data.</p>
          <p>MedBridge is informational only and is not medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
