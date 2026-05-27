import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Phone, Briefcase, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type Job, categories as fallbackCategories } from "@/lib/jobs-data";
import { toast } from "sonner";

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"jobs" | "categories">("jobs");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("admin_logged_in") === "true");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Form states for jobs
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [logo, setLogo] = useState("N");
  const [location, setLocation] = useState("Remote");
  const [type, setType] = useState<"Full-time" | "Part-time" | "Contract" | "Remote">("Full-time");
  const [salary, setSalary] = useState("");
  const [salaryMin, setSalaryMin] = useState(100000);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [phone, setPhone] = useState("");
  const [featured, setFeatured] = useState(false);

  // Form states for adding category
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Briefcase");
  const [addingCat, setAddingCat] = useState(false);

  const fetchJobs = () => {
    setLoading(true);
    fetch("/api/jobs")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load jobs");
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Admin load jobs error:", err);
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    fetch("/api/categories")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load categories");
      })
      .then((data) => {
        setCategories(data);
        // Default category select option value
        if (data.length > 0 && !category) {
          setCategory(data[0].name);
        }
      })
      .catch((err) => {
        console.error("Admin load categories error:", err);
        setCategories(fallbackCategories);
        if (fallbackCategories.length > 0 && !category) {
          setCategory(fallbackCategories[0].name);
        }
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchJobs();
      fetchCategories();
    }
  }, [isLoggedIn]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin@coimbatorejobs.com" && password === "coimbatorejob2121") {
      setIsLoggedIn(true);
      localStorage.setItem("admin_logged_in", "true");
      toast.success("Welcome back, Administrator!");
    } else {
      toast.error("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("admin_logged_in");
    toast.success("Successfully logged out.");
  };

  const openAddModal = () => {
    setEditingJob(null);
    setTitle("");
    setCompany("");
    setLogo("N");
    setLocation("Remote");
    setType("Full-time");
    setSalary("");
    setSalaryMin(100000);
    // Use first available category or default to Engineering
    setCategory(categories.length > 0 ? categories[0].name : "Engineering");
    setTags("");
    setDescription("");
    setResponsibilities("");
    setRequirements("");
    setPhone("");
    setFeatured(false);
    setModalOpen(true);
  };
  
  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setLogo(job.logo);
    setLocation(job.location);
    setType(job.type);
    setSalary(job.salary);
    setSalaryMin(job.salaryMin);
    setCategory(job.category);
    setTags(job.tags.join(", "));
    setDescription(job.description);
    setResponsibilities(job.responsibilities ? job.responsibilities.join("\n") : "");
    setRequirements(job.requirements ? job.requirements.join("\n") : "");
    setPhone(job.phone || "");
    setFeatured(!!job.featured);
    setModalOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !company || !location || !salary || !phone || !description || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    const jobPayload = {
      title,
      company,
      logo: logo || company.charAt(0).toUpperCase(),
      location,
      type,
      salary,
      salaryMin: Number(salaryMin),
      category,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      description,
      responsibilities: responsibilities.split("\n").map(r => r.trim()).filter(Boolean),
      requirements: requirements.split("\n").map(r => r.trim()).filter(Boolean),
      phone,
      featured
    };
    
    try {
      let response;
      if (editingJob) {
        response = await fetch(`/api/jobs/${editingJob.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobPayload),
        });
      } else {
        response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobPayload),
        });
      }
      
      if (response.ok) {
        toast.success(editingJob ? "Job updated successfully!" : "Job added successfully!");
        setModalOpen(false);
        fetchJobs(); // Reload jobs list
      } else {
        const errText = await response.text();
        let errorMessage = "Failed to save job";
        try {
          const errData = JSON.parse(errText);
          errorMessage = errData.error || errorMessage;
        } catch {
          errorMessage = errText || errorMessage;
        }
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving the job.");
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("Job deleted successfully!");
        fetchJobs();
      } else {
        toast.error("Failed to delete job.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the job.");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setAddingCat(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), icon: newCatIcon })
      });
      if (response.ok) {
        toast.success("Category added successfully!");
        setNewCatName("");
        setNewCatIcon("Briefcase");
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add category.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while adding the category.");
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this category? Any jobs under this category will remain, but the category filter option will be removed.")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        toast.success("Category deleted successfully!");
        fetchCategories();
      } else {
        toast.error("Failed to delete category.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the category.");
    }
  };
  
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
        <div className="glass rounded-3xl p-8 w-full max-w-md border border-border shadow-[var(--shadow-elegant)] animate-fade-up relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-30 blur-2xl animate-pulse-glow" style={{ background: "var(--gradient-primary)" }} />
          
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-4 glow-ring" style={{ background: "var(--gradient-primary)" }}>
              <Briefcase className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-3xl">Admin <span className="gradient-text">Portal</span></h2>
            <p className="text-sm text-muted-foreground mt-2">Sign in to access your Coimbatore Jobs dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</label>
              <Input
                required
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 h-11 bg-background/50 border-border"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
              <Input
                required
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11 bg-background/50 border-border"
              />
            </div>

            <Button type="submit" className="w-full h-11 mt-2 glow-ring hover-lift" style={{ background: "var(--gradient-primary)" }}>
              Access Dashboard
            </Button>

            <div className="pt-4 text-center text-xs text-muted-foreground border-t border-border mt-6">
              <p className="font-medium text-muted-foreground/75">Demo Credentials:</p>
              <p className="mt-1 font-mono text-primary-glow select-all">
                admin@coimbatorejobs.com / coimbatorejob2121
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl">Admin <span className="gradient-text">Dashboard</span></h1>
          <p className="text-muted-foreground mt-2">Manage job listings and category details</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleLogout} className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors">
            Log out
          </Button>
          {activeTab === "jobs" && (
            <Button onClick={openAddModal} className="glow-ring" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="mr-2 h-4 w-4" /> Add New Job
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-border pb-px">
        <button 
          onClick={() => setActiveTab("jobs")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "jobs" 
              ? "border-primary text-primary-glow" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Manage Jobs ({jobs.length})
        </button>
        <button 
          onClick={() => setActiveTab("categories")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "categories" 
              ? "border-primary text-primary-glow" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Manage Categories ({categories.length})
        </button>
      </div>
      
      {/* Tab Contents: Jobs */}
      {activeTab === "jobs" && (
        <div className="glass rounded-2xl overflow-hidden border border-border animate-fade-up">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading dashboard...
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Briefcase className="h-12 w-12 text-muted-foreground/50" />
              <p>No jobs found. Click "Add New Job" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="p-4 text-sm font-semibold">Job Details</th>
                    <th className="p-4 text-sm font-semibold">Category</th>
                    <th className="p-4 text-sm font-semibold">Salary & Type</th>
                    <th className="p-4 text-sm font-semibold">Call Number</th>
                    <th className="p-4 text-sm font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white bg-primary-glow/20 text-primary-glow shrink-0">
                            {job.logo}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              {job.title}
                              {job.featured && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-glow/20 text-primary-glow font-medium flex items-center gap-0.5">
                                  <Sparkles className="h-2 w-2" /> Featured
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{job.company} · {job.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{job.category}</td>
                      <td className="p-4 text-sm">
                        <div className="font-medium text-primary-glow">{job.salary}</div>
                        <div className="text-xs text-muted-foreground">{job.type}</div>
                      </td>
                      <td className="p-4 text-sm font-mono flex items-center gap-1.5 mt-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {job.phone}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(job)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive" onClick={() => handleDelete(job.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Categories */}
      {activeTab === "categories" && (
        <div className="grid gap-6 md:grid-cols-[320px_1fr] animate-fade-up">
          {/* Add Category Form */}
          <div className="glass rounded-2xl p-6 h-fit border border-border shadow-[var(--shadow-card)]">
            <h3 className="font-display font-semibold text-lg mb-4">Add Custom Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category Name *</label>
                <Input 
                  required 
                  className="mt-1.5 bg-background/50" 
                  placeholder="e.g. Design & Creative" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category Icon</label>
                <select 
                  className="mt-1.5 block w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                >
                  <option value="Briefcase">Briefcase (Default)</option>
                  <option value="Code2">Code2 (Engineering)</option>
                  <option value="Palette">Palette (Design)</option>
                  <option value="Megaphone">Megaphone (Marketing)</option>
                  <option value="Boxes">Boxes (Product)</option>
                  <option value="Brain">Brain (Data & AI)</option>
                  <option value="TrendingUp">TrendingUp (Sales)</option>
                  <option value="DollarSign">DollarSign (Finance)</option>
                  <option value="Settings2">Settings2 (Operations)</option>
                </select>
              </div>
              <Button type="submit" disabled={addingCat} className="w-full glow-ring mt-4 hover-lift" style={{ background: "var(--gradient-primary)" }}>
                {addingCat ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </div>

          {/* Categories Grid */}
          <div className="glass rounded-2xl p-6 border border-border shadow-[var(--shadow-card)]">
            <h3 className="font-display font-semibold text-lg mb-4">Existing Categories</h3>
            {categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No categories found. Add one on the left.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <div key={cat.id || cat.name} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/10 hover:bg-secondary/25 transition-all duration-200 border border-border/40">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary-glow/10 text-primary-glow shrink-0">
                        <Briefcase className="h-4.5 w-4.5" />
                      </div>
                      <span className="font-medium text-sm truncate text-foreground">{cat.name}</span>
                    </div>
                    {cat.id && (
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal dialog for Add / Edit Job */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-up border border-border">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
              <h2 className="font-display font-semibold text-xl">
                {editingJob ? "Edit Job Listing" : "Add New Job Listing"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Title *</label>
                  <Input required className="mt-1" placeholder="e.g. Senior Frontend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company Name *</label>
                  <Input required className="mt-1" placeholder="e.g. Nebula Labs" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Logo letter</label>
                  <Input maxLength={1} className="mt-1" placeholder="e.g. N" value={logo} onChange={(e) => setLogo(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location *</label>
                  <Input required className="mt-1" placeholder="e.g. Remote, Austin, TX" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recruiter Phone Number *</label>
                  <Input required type="tel" className="mt-1 font-mono" placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Type</label>
                  <select 
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
                    value={type} 
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category *</label>
                  <select 
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Salary Range *</label>
                  <Input required className="mt-1" placeholder="e.g. ₹6L – ₹10L" value={salary} onChange={(e) => setSalary(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Min Salary (Numeric) for filters</label>
                  <Input type="number" className="mt-1" placeholder="e.g. 600000" value={salaryMin} onChange={(e) => setSalaryMin(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags (comma separated)</label>
                <Input className="mt-1" placeholder="React, TypeScript, Next.js" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Description *</label>
                <Textarea required className="mt-1" rows={3} placeholder="Describe the role details..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Responsibilities (one per line)</label>
                <Textarea className="mt-1 font-sans" rows={3} placeholder="Own the frontend code&#10;Write unit tests" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Requirements (one per line)</label>
                <Textarea className="mt-1 font-sans" rows={3} placeholder="5+ years of experience&#10;Strong communication skills" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="featured" 
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4 bg-background" 
                  checked={featured} 
                  onChange={(e) => setFeatured(e.target.checked)} 
                />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Feature this job listing on the home page</label>
              </div>
              
              {/* Modal Footer */}
              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="glow-ring" style={{ background: "var(--gradient-primary)" }}>
                  {editingJob ? "Save Changes" : "Create Job"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
