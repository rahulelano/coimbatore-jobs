import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/site/Navbar";
import { Footer } from "./components/site/Footer";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CompaniesPage from "./pages/CompaniesPage";
import ContactPage from "./pages/ContactPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import AdminPage from "./pages/AdminPage";
import { Toaster } from "sonner";
import ScrollToTop from "./components/site/ScrollToTop";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="pt-24 flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster richColors position="top-right" />
      </div>
    </Router>
  );
}
