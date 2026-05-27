import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ArrowRight, Sparkles, Zap, Shield, Brain, MessageSquare, BarChart3, Star, Code2, Palette, Megaphone, Boxes, TrendingUp, DollarSign, Settings2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/site/JobCard";
import { categories, testimonials, type Job } from "@/lib/jobs-data";
import heroBg from "@/assets/hero-bg.jpg";

// Predefined companies styling (logos + specific colors) if they exist in jobs
const predefinedCompaniesMap: Record<string, { logo: string; color: string }> = {
  "nebula": { logo: "N", color: "from-violet-500 to-indigo-500" },
  "orbit": { logo: "O", color: "from-cyan-500 to-blue-500" },
  "lumen": { logo: "L", color: "from-fuchsia-500 to-pink-500" },
  "atlas": { logo: "A", color: "from-emerald-500 to-teal-500" },
  "vertex": { logo: "V", color: "from-amber-500 to-orange-500" },
  "pulse": { logo: "P", color: "from-rose-500 to-red-500" },
};

const gradients = [
  "from-violet-500 to-indigo-500",
  "from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-500",
  "from-purple-500 to-indigo-500",
  "from-teal-500 to-cyan-500",
];

function getCompanyGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

const iconMap = { Code2, Palette, Megaphone, Boxes, Brain, TrendingUp, DollarSign, Settings2, Briefcase };

export default function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories
    fetch("/api/categories")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch categories");
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.warn("Could not fetch categories, using static fallback", err);
        import("@/lib/jobs-data").then(({ categories: staticCats }) => {
          setCategories(staticCats);
        });
      });

    // Fetch jobs
    fetch("/api/jobs")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Could not fetch jobs from API, using static data fallback", err);
        import("@/lib/jobs-data").then(({ jobs: staticJobs }) => {
          setJobs(staticJobs);
          setLoading(false);
        });
      });
  }, []);

  const dynamicCompanies = useMemo(() => {
    const compMap = new Map<string, { name: string; logo: string; color: string }>();
    const normalize = (name: string) => name.trim().toLowerCase();

    jobs.forEach((job) => {
      if (!job.company) return;
      const normName = normalize(job.company);
      if (!compMap.has(normName)) {
        const pred = predefinedCompaniesMap[normName];
        compMap.set(normName, {
          name: job.company,
          logo: job.logo && job.logo !== "N" ? job.logo : (pred ? pred.logo : job.company.charAt(0).toUpperCase()),
          color: pred ? pred.color : getCompanyGradient(job.company),
        });
      }
    });

    return Array.from(compMap.values()).slice(0, 6);
  }, [jobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (q) queryParams.set("q", q);
    if (loc) queryParams.set("location", loc);
    navigate(`/jobs?${queryParams.toString()}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" width={1536} height={1024} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, var(--background) 90%)" }} />
        </div>

        <div className="container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
              <span>AI-powered job matching is live</span>
            </div>

            <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight leading-[1.05]">
              Find your{" "}
              <span className="gradient-text">dream job</span>
              <br />
              faster than ever
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join 2M+ professionals matching with remarkable teams. Smart search, instant apply, and AI-curated recommendations built for the next decade of work.
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-10 max-w-3xl mx-auto"
            >
              <div className="glass rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-[var(--shadow-elegant)]">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="Job title, keywords, or company"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-base h-12"
                  />
                </div>
                <div className="hidden md:block w-px bg-border" />
                <div className="flex-1 flex items-center gap-2 px-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="Location or 'Remote'"
                    value={loc}
                    onChange={(e) => setLoc(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-base h-12"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-6 glow-ring" style={{ background: "var(--gradient-primary)" }}>
                  Search jobs <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span>Trending:</span>
                {["Remote React", "Product Design", "ML Engineer", "Growth"].map((t) => (
                  <button key={t} type="button" onClick={() => setQ(t)} className="hover:text-foreground transition-colors underline-offset-4 hover:underline">
                    {t}
                  </button>
                ))}
              </div>
            </form>

            <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
              {[
                { v: "2M+", l: "Active talent" },
                { v: "45k+", l: "Open roles" },
                { v: "8k+", l: "Top companies" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="font-display font-bold text-3xl md:text-4xl gradient-text">{s.v}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPANIES */}
      {dynamicCompanies.length > 0 && (
        <section className="container mx-auto px-4 py-12 animate-fade-up">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {dynamicCompanies.map((c) => (
              <div key={c.name} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {c.logo}
                </div>
                <span className="font-display font-semibold">{c.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl md:text-5xl">Explore by <span className="gradient-text">category</span></h2>
          <p className="mt-3 text-muted-foreground">Pick your field and discover roles handpicked for you.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon as keyof typeof iconMap] || Briefcase;
            const count = jobs.filter((j) => j.category.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <Link key={cat.name} to={`/jobs?category=${encodeURIComponent(cat.name)}`} className="group glass rounded-2xl p-6 hover-lift">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "color-mix(in oklab, var(--primary) 18%, transparent)" }}>
                  <Icon className="h-6 w-6 text-primary-glow" />
                </div>
                <h3 className="font-display font-semibold">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{count} open roles</p>
                <div className="mt-4 flex items-center text-sm text-primary-glow opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display font-bold text-4xl md:text-5xl">Featured <span className="gradient-text">opportunities</span></h2>
            <p className="mt-3 text-muted-foreground">Curated handpicks from teams shaping the future.</p>
          </div>
          <Link to="/jobs"><Button variant="outline">View all jobs <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading featured jobs...</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.filter((j) => j.featured).map((j) => <JobCard key={j.id} job={j} />)}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl md:text-5xl">How <span className="gradient-text">Coimbatore Jobs</span> works</h2>
          <p className="mt-3 text-muted-foreground">Land your next role in three simple steps.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Zap, t: "Create your profile", d: "Build a stunning profile in minutes with our AI-assisted resume parser." },
            { icon: Brain, t: "Get AI-matched roles", d: "Our engine surfaces roles you'd actually take, ranked by fit." },
            { icon: Shield, t: "Apply with confidence", d: "One-click apply, real-time updates, and direct chat with hiring teams." },
          ].map((step, i) => (
            <div key={step.t} className="relative glass rounded-2xl p-8 hover-lift">
              <div className="absolute -top-4 -left-2 font-display font-bold text-7xl opacity-10">{i + 1}</div>
              <div className="relative">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-5 glow-ring" style={{ background: "var(--gradient-primary)" }}>
                  <step.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-xl">{step.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SPLIT */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight">Built for ambitious <span className="gradient-text">careers</span></h2>
            <p className="mt-4 text-muted-foreground text-lg">Every feature you need — and several you didn't know you wanted.</p>
            <div className="mt-8 space-y-5">
              {[
                { icon: Brain, t: "AI resume analyzer", d: "Instant feedback on what to improve, tailored per role." },
                { icon: MessageSquare, t: "Real-time messaging", d: "Skip the email chain — chat directly with hiring teams." },
                { icon: BarChart3, t: "Application analytics", d: "Track views, response rates, and interview funnels." },
              ].map((f) => (
                <div key={f.t} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in oklab, var(--primary) 18%, transparent)" }}>
                    <f.icon className="h-5 w-5 text-primary-glow" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{f.t}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 blur-3xl opacity-50" style={{ background: "var(--gradient-glow)" }} />
            <div className="glass rounded-3xl p-6 animate-float">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-muted-foreground">Your dashboard</p>
                  <h3 className="font-display font-semibold text-lg">Welcome back, Priya</h3>
                </div>
                <div className="text-xs px-2.5 py-1 rounded-full" style={{ background: "color-mix(in oklab, var(--success) 20%, transparent)", color: "var(--success)" }}>+12% this week</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[{ v: 24, l: "Applied" }, { v: 8, l: "Interviews" }, { v: 3, l: "Offers" }].map((m) => (
                  <div key={m.l} className="rounded-xl p-3 text-center" style={{ background: "color-mix(in oklab, var(--card) 70%, transparent)" }}>
                    <div className="font-display font-bold text-2xl gradient-text">{m.v}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.l}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {!loading && jobs.slice(0, 3).map((j) => (
                  <div key={j.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/40 transition-colors">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>{j.logo}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{j.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{j.company}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{j.posted}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl md:text-5xl">Loved by <span className="gradient-text">professionals</span></h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6 hover-lift">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current text-warning" />)}
              </div>
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>{t.avatar}</div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl glass p-10 md:p-16 text-center">
          <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="font-display font-bold text-4xl md:text-6xl">Ready to find your <span className="gradient-text">next chapter?</span></h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Join the platform redefining how talent and teams find each other.
          </p>
        </div>
      </section>
    </div>
  );
}
