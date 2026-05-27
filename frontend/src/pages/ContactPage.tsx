import { useState } from "react";
import { Mail, MapPin, MessageSquare, Send, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });

      if (response.ok) {
        setSent(true);
        toast.success("Message sent successfully!");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Contact send error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-5xl md:text-6xl">Get in <span className="gradient-text">touch</span></h1>
        <p className="mt-4 text-muted-foreground text-lg">We'd love to hear from you. Reach out anytime.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          {[
            { icon: Mail, t: "Email", d: "thecoimbatorejobs@gmail.com" },
            { icon: Phone, t: "Phone", d: "+91 86081 77777" },
            { icon: MapPin, t: "Address", d: "No 3G-1, KK Residency Building, Venkatasamy Road East, R.S. Puram, Coimbatore - 641002" },
          ].map((c) => (
            <div key={c.t} className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in oklab, var(--primary) 18%, transparent)" }}>
                <c.icon className="h-5 w-5 text-primary-glow" />
              </div>
              <div>
                <p className="font-semibold">{c.t}</p>
                <p className="text-sm text-muted-foreground">{c.d}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-8"
        >
          {sent ? (
            <div className="text-center py-10">
              <div className="h-14 w-14 mx-auto rounded-full flex items-center justify-center mb-4 glow-ring" style={{ background: "var(--gradient-primary)" }}>
                <Send className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-xl">Message sent!</h3>
              <p className="text-muted-foreground mt-2 text-sm">We'll get back to you within 24 hours.</p>
              <Button type="button" onClick={() => setSent(false)} variant="outline" className="mt-6">
                Send another message
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    required 
                    className="mt-1.5" 
                    placeholder="Jane Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    required 
                    type="email" 
                    className="mt-1.5" 
                    placeholder="jane@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input 
                  required 
                  className="mt-1.5" 
                  placeholder="How can we help?" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  required 
                  rows={6} 
                  className="mt-1.5" 
                  placeholder="Tell us a bit more…" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full glow-ring" 
                style={{ background: "var(--gradient-primary)" }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    Sending message <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Send message <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
