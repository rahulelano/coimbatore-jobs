import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Job } from "./models/Job.js";
import { Contact } from "./models/Contact.js";
import { Category } from "./models/Category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas");
    await seedDatabase();
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

// Seeding logic to populate DB on first run if empty
async function seedDatabase() {
  try {
    // Clean up existing mock jobs from Atlas MongoDB
    const mockCompanies = ["Nebula Labs", "Orbit", "Lumen AI", "Atlas", "Vertex", "Pulse"];
    const deleteResult = await Job.deleteMany({ company: { $in: mockCompanies } });
    if (deleteResult.deletedCount > 0) {
      console.log(`Deleted ${deleteResult.deletedCount} existing mock jobs from database.`);
    }
    // Seed default categories if none exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: "Engineering", icon: "Code2" },
        { name: "Design", icon: "Palette" },
        { name: "Marketing", icon: "Megaphone" },
        { name: "Product", icon: "Boxes" },
        { name: "Data & AI", icon: "Brain" },
        { name: "Sales", icon: "TrendingUp" },
        { name: "Finance", icon: "DollarSign" },
        { name: "Operations", icon: "Settings2" }
      ];
      await Category.insertMany(defaultCategories);
      console.log("Seeded default categories.");
    }
  } catch (error) {
    console.error("Error cleaning mock database:", error);
  }
}

// API Routes

// GET /api/jobs - List all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    // Transform _id to id for frontend compatibility
    const formatted = jobs.map(j => {
      const obj = j.toObject();
      obj.id = obj._id.toString();
      delete obj._id;
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/:id - Get single job details
app.get("/api/jobs/:id", async (req, res) => {
  try {
    // Handle both ObjectId and string lookups
    const query = mongoose.isValidObjectId(req.params.id) 
      ? { _id: req.params.id }
      : { id: req.params.id };

    const job = await Job.findOne(query);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const obj = job.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs - Create a new job
app.post("/api/jobs", async (req, res) => {
  try {
    const { 
      title, company, logo, location, type, salary, salaryMin, 
      category, posted, tags, description, responsibilities, requirements, 
      featured, phone 
    } = req.body;

    const newJob = new Job({
      title, company, logo, location, type, salary, 
      salaryMin: salaryMin ? Number(salaryMin) : 0, 
      category, posted: posted || "Just now", 
      tags: Array.isArray(tags) ? tags : [],
      description, 
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [], 
      requirements: Array.isArray(requirements) ? requirements : [], 
      featured: !!featured, 
      phone
    });

    await newJob.save();
    
    const obj = newJob.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/jobs/:id - Update an existing job
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id) 
      ? { _id: req.params.id }
      : { id: req.params.id };

    const updatedJob = await Job.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    const obj = updatedJob.toObject();
    obj.id = obj._id.toString();
    delete obj._id;

    res.json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/jobs/:id - Delete a job
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id) 
      ? { _id: req.params.id }
      : { id: req.params.id };

    const deletedJob = await Job.findOneAndDelete(query);
    if (!deletedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ message: "Job deleted successfully", id: deletedJob._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/contacts - Save contact message to DB
app.post("/api/contacts", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    res.status(201).json({ message: "Contact message saved successfully", contact: newContact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET /api/categories - List all categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    const formatted = categories.map(c => {
      const obj = c.toObject();
      obj.id = obj._id.toString();
      delete obj._id;
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories - Create a new category
app.post("/api/categories", async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }
    const newCategory = new Category({
      name: name.trim(),
      icon: icon || "Briefcase"
    });
    await newCategory.save();
    
    const obj = newCategory.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/categories/:id - Delete a category
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id) 
      ? { _id: req.params.id }
      : { id: req.params.id };

    const deleted = await Category.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted successfully", id: deleted._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
