import { Heart, Rocket, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center">
        <h1 className="font-display font-bold text-5xl md:text-6xl">About <span className="gradient-text">Coimbatore Jobs</span></h1>
        <p className="mt-5 text-lg text-muted-foreground">
          We believe finding the right job should feel inspiring — not exhausting. Coimbatore Jobs is the modern career platform built around what actually matters: fit, transparency, and respect for your time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-16">
        {[
          { icon: Rocket, t: "Move fast", d: "Apply in one click. Hear back in days, not weeks." },
          { icon: Heart, t: "Care deeply", d: "Real humans behind every conversation, on both sides." },
          { icon: Users, t: "Build together", d: "We win when great teams meet great talent." },
        ].map((v) => (
          <div key={v.t} className="glass rounded-2xl p-6 hover-lift">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
              <v.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg">{v.t}</h3>
            <p className="text-sm text-muted-foreground mt-2">{v.d}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-10 mt-16 text-center">
        <h2 className="font-display font-bold text-3xl">Our mission</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          To connect every ambitious professional with their next remarkable opportunity — powered by AI, designed with care.
        </p>
      </div>
    </div>
  );
}
