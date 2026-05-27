import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { JobCard } from "@/components/site/JobCard";
import { categories as fallbackCategories, type Job } from "@/lib/jobs-data";

const TYPES = ["Full-time", "Part-time", "Contract", "Remote"] as const;

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const locParam = searchParams.get("location") ?? "";
  const companyParam = searchParams.get("company") ?? "";
  const categoryParam = searchParams.get("category") ?? "";

  const [q, setQ] = useState(qParam);
  const [loc, setLoc] = useState(locParam);
  const [company, setCompany] = useState(companyParam);
  const [salary, setSalary] = useState<number[]>([0]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>(categoryParam ? [categoryParam] : []);
  
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

  // Sync inputs with URL search parameters
  useEffect(() => {
    setQ(qParam);
    setLoc(locParam);
    setCompany(companyParam);
    if (categoryParam) {
      setSelectedCats([categoryParam]);
    }
  }, [qParam, locParam, companyParam, categoryParam]);

  // Update URL search parameters as inputs change (or on submit/change)
  const updateUrlParams = (newQ: string, newLoc: string, keepCompany: boolean = true) => {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newLoc) params.set("location", newLoc);
    if (keepCompany && company) params.set("company", company);
    setSearchParams(params);
  };

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (company && j.company.toLowerCase() !== company.toLowerCase()) return false;
      if (q && !`${j.title} ${j.company} ${j.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (loc && !j.location.toLowerCase().includes(loc.toLowerCase())) return false;
      if (selectedTypes.length && !selectedTypes.includes(j.type)) return false;
      if (selectedCats.length && !selectedCats.includes(j.category)) return false;
      if (salary[0] && j.salaryMin < salary[0]) return false;
      return true;
    });
  }, [jobs, company, q, loc, selectedTypes, selectedCats, salary]);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl">
          {company ? (
            <>Jobs at <span className="gradient-text">{company}</span></>
          ) : (
            <>Browse <span className="gradient-text">jobs</span></>
          )}
        </h1>
        <p className="text-muted-foreground mt-2">
          {loading ? "Loading roles..." : `${filtered.length} of ${jobs.length} roles matching your filters`}
        </p>
        
        {company && (
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-glow border border-primary/20">
              Company: {company}
              <button 
                onClick={() => {
                  setCompany("");
                  const params = new URLSearchParams(searchParams);
                  params.delete("company");
                  setSearchParams(params);
                }}
                className="hover:text-foreground font-bold ml-1 flex items-center justify-center rounded-full p-0.5 hover:bg-secondary"
                title="Remove company filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="glass rounded-2xl p-2 flex flex-col md:flex-row gap-2 mb-8">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            value={q} 
            onChange={(e) => { setQ(e.target.value); updateUrlParams(e.target.value, loc); }} 
            placeholder="Search title, company, skill…" 
            className="border-0 bg-transparent focus-visible:ring-0 h-11" 
          />
        </div>
        <div className="hidden md:block w-px bg-border" />
        <div className="flex-1 flex items-center gap-2 px-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Input 
            value={loc} 
            onChange={(e) => { setLoc(e.target.value); updateUrlParams(q, e.target.value); }} 
            placeholder="Location" 
            className="border-0 bg-transparent focus-visible:ring-0 h-11" 
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="glass rounded-2xl p-6 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal className="h-4 w-4 text-primary-glow" />
            <h3 className="font-display font-semibold">Filters</h3>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Job type</h4>
            <div className="space-y-2">
              {TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedTypes.includes(t)} onCheckedChange={() => toggle(selectedTypes, t, setSelectedTypes)} />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Category</h4>
            <div className="space-y-2 max-h-56 overflow-auto pr-2">
              {categories.map((c) => (
                <label key={c.name} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedCats.includes(c.name)} onCheckedChange={() => toggle(selectedCats, c.name, setSelectedCats)} />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Min salary: <span className="gradient-text font-semibold">{salary[0] === 0 ? "Any" : (salary[0] >= 100000 ? `₹${(salary[0] / 100000).toFixed(1)}L` : `₹${(salary[0] / 1000).toFixed(0)}k`)}</span></h4>
            <Slider value={salary} onValueChange={setSalary} min={0} max={3000000} step={50000} />
          </div>

          <Button variant="outline" className="w-full" onClick={() => { 
            setSelectedTypes([]); 
            setSelectedCats([]); 
            setSalary([0]); 
            setQ(""); 
            setLoc(""); 
            setCompany("");
            const params = new URLSearchParams();
            setSearchParams(params);
          }}>
            Clear all
          </Button>
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
              Loading jobs...
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-foreground">No jobs match your filters.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filtered.map((j) => <JobCard key={j.id} job={j} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
