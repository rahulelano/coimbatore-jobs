import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { type Job } from "@/lib/jobs-data";

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

export default function CompaniesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    const compMap = new Map<string, { name: string; logo: string; color: string; count: number }>();
    const normalize = (name: string) => name.trim().toLowerCase();

    // Aggregate jobs to dynamically populate companies list
    jobs.forEach((job) => {
      if (!job.company) return;
      const normName = normalize(job.company);
      if (compMap.has(normName)) {
        const existing = compMap.get(normName)!;
        existing.count += 1;
        // Keep name exactly as updated by job, and update logo if provided
        if (job.logo && job.logo !== "N") {
          existing.logo = job.logo;
        }
      } else {
        const pred = predefinedCompaniesMap[normName];
        compMap.set(normName, {
          name: job.company,
          logo: job.logo && job.logo !== "N" ? job.logo : (pred ? pred.logo : job.company.charAt(0).toUpperCase()),
          color: pred ? pred.color : getCompanyGradient(job.company),
          count: 1,
        });
      }
    });

    // Convert map to array and sort: companies with most jobs first, then by name
    return Array.from(compMap.values()).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
  }, [jobs]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-5xl md:text-6xl">Active <span className="gradient-text">companies</span></h1>
        <p className="mt-4 text-muted-foreground text-lg">Discover the teams shaping the future of work.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading companies...</div>
      ) : dynamicCompanies.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground max-w-md mx-auto">
          No companies found. Create a job listing to get started!
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {dynamicCompanies.map((c) => {
            return (
              <Link 
                key={c.name} 
                to={`/jobs?company=${encodeURIComponent(c.name)}`} 
                className="glass rounded-2xl p-6 hover-lift"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white font-display font-bold text-xl`}>
                    {c.logo}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">{c.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3" /> {c.count} open roles
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  A team of builders pushing the boundaries of what's possible. Remote-friendly, well-funded, and growing fast.
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
