import { Link } from "react-router-dom";
import { Bookmark, MapPin, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/lib/jobs-data";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group relative block rounded-2xl glass p-6 hover-lift overflow-hidden"
    >
      {job.featured && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" style={{ background: "color-mix(in oklab, var(--primary) 20%, transparent)", color: "var(--primary-glow)" }}>
          <Sparkles className="h-3 w-3" /> Featured
        </div>
      )}

      <div className="flex items-start gap-4">
        <div
          className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center font-display font-bold text-lg text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          {job.logo}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{job.company}</p>
          <h3 className="font-display font-semibold text-base mt-0.5 truncate group-hover:text-primary-glow transition-colors">
            {job.title}
          </h3>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.tags.slice(0, 3).map((t) => (
          <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location.split("·")[0].trim()}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.posted}</span>
        </div>
        <Bookmark className="h-4 w-4 hover:text-primary cursor-pointer" />
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <span className="font-display font-semibold text-sm gradient-text">{job.salary}</span>
        <span className="text-xs text-muted-foreground">{job.type}</span>
      </div>
    </Link>
  );
}
