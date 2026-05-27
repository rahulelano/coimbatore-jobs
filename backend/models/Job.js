import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  logo: { type: String, default: "N" },
  location: { type: String, required: true },
  type: { type: String, enum: ["Full-time", "Part-time", "Contract", "Remote"], default: "Full-time" },
  salary: { type: String, required: true },
  salaryMin: { type: Number, default: 0 },
  category: { type: String, required: true },
  posted: { type: String, default: "Just now" },
  tags: [{ type: String }],
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  requirements: [{ type: String }],
  featured: { type: Boolean, default: false },
  phone: { type: String, required: true } // Contact number for call integration
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);
