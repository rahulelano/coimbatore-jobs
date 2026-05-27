export type Job = {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary: string;
  salaryMin: number;
  category: string;
  posted: string;
  tags: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  featured?: boolean;
  phone?: string;
};

export const categories = [
  { name: "Engineering", icon: "Code2", count: 1284 },
  { name: "Design", icon: "Palette", count: 642 },
  { name: "Marketing", icon: "Megaphone", count: 521 },
  { name: "Product", icon: "Boxes", count: 389 },
  { name: "Data & AI", icon: "Brain", count: 712 },
  { name: "Sales", icon: "TrendingUp", count: 458 },
  { name: "Finance", icon: "DollarSign", count: 311 },
  { name: "Operations", icon: "Settings2", count: 276 },
];

export const jobs: Job[] = [];

export const testimonials = [
  { name: "Priya Sharma", role: "Frontend Engineer @ Stripe", quote: "Found my dream role in 2 weeks. The AI match was uncannily good.", avatar: "P" },
  { name: "Marcus Lee", role: "Design Lead @ Linear", quote: "NextHire's UX is leagues ahead of every other portal I've used.", avatar: "M" },
  { name: "Ana Costa", role: "PM @ Notion", quote: "The employer side is brilliant. We hired three engineers in a month.", avatar: "A" },
];
