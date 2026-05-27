import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Building2, Check, Clock, MapPin, Send, Share2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Job } from "@/lib/jobs-data";

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [related, setRelated] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/api/jobs")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch jobs");
      })
      .then((allJobs: Job[]) => {
        const foundJob = allJobs.find((j) => j.id === jobId);
        if (!foundJob) {
          setError("Job not found");
          setLoading(false);
          return;
        }
        setJob(foundJob);
        const relatedJobs = allJobs.filter((j) => j.category === foundJob.category && j.id !== foundJob.id).slice(0, 3);
        setRelated(relatedJobs);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch from API, trying fallback to static data", err);
        import("@/lib/jobs-data").then(({ jobs: staticJobs }) => {
          const foundJob = staticJobs.find((j) => j.id === jobId);
          if (!foundJob) {
            setError("Job not found");
            setLoading(false);
            return;
          }
          setJob(foundJob);
          const relatedJobs = staticJobs.filter((j) => j.category === foundJob.category && j.id !== foundJob.id).slice(0, 3);
          setRelated(relatedJobs);
          setLoading(false);
        });
      });
  }, [jobId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading job details...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">{error || "Job not found"}</h1>
        <Link to="/jobs"><Button className="mt-6">Back to jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="glass rounded-2xl p-8">
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                {job.logo}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <h1 className="font-display font-bold text-3xl md:text-4xl mt-1">{job.title}</h1>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{job.posted}</span>
                  <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />{job.type}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {job.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
          </div>

          <div className="glass rounded-2xl p-8 mt-6">
            <h2 className="font-display font-semibold text-xl">About the role</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{job.description}</p>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <>
                <h3 className="font-display font-semibold mt-8 mb-3">What you'll do</h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((r) => (
                    <li key={r} className="flex gap-3 text-sm">
                      <Check className="h-5 w-5 text-primary-glow shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <>
                <h3 className="font-display font-semibold mt-8 mb-3">What we're looking for</h3>
                <ul className="space-y-2">
                  {job.requirements.map((r) => (
                    <li key={r} className="flex gap-3 text-sm">
                      <Check className="h-5 w-5 text-primary-glow shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display font-semibold text-xl mb-4">Similar roles</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link key={r.id} to={`/jobs/${r.id}`} className="glass rounded-2xl p-5 hover-lift block">
                    <p className="text-xs text-muted-foreground">{r.company}</p>
                    <p className="font-display font-semibold mt-1">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-2">{r.location}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs text-muted-foreground">Salary range</p>
            <p className="font-display font-bold text-2xl gradient-text mt-1">{job.salary}</p>
            <div className="mt-5 space-y-2">
              {job.phone ? (
                <a href={`tel:${job.phone}`} className="block w-full">
                  <Button className="w-full glow-ring" size="lg" style={{ background: "var(--gradient-primary)" }}>
                    <Phone className="mr-2 h-4 w-4" /> Call Recruiter ({job.phone})
                  </Button>
                </a>
              ) : (
                <Button className="w-full glow-ring" size="lg" style={{ background: "var(--gradient-primary)" }}>
                  <Send className="mr-2 h-4 w-4" /> Apply now
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm"><Bookmark className="mr-1 h-4 w-4" /> Save</Button>
                <Button variant="outline" size="sm"><Share2 className="mr-1 h-4 w-4" /> Share</Button>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold">About {job.company}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              A forward-thinking team building products people love. Backed by world-class investors.
            </p>
            <Button variant="ghost" size="sm" className="mt-3 px-0">View company →</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
