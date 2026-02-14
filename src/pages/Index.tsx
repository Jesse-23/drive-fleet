import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Clock, Car, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-car.jpg";

const features = [
  { icon: Car, title: "Premium Fleet", desc: "Hand-picked vehicles from world-class manufacturers." },
  { icon: Shield, title: "Fully Insured", desc: "Comprehensive coverage on every rental, zero hassle." },
  { icon: Clock, title: "Instant Booking", desc: "Book in seconds, pick up on your schedule." },
  { icon: Star, title: "5-Star Service", desc: "Dedicated support team available around the clock." },
];

const steps = [
  { num: "01", title: "Choose Your Car", desc: "Browse our curated fleet and find the perfect ride." },
  { num: "02", title: "Pick Your Dates", desc: "Select pickup and return dates that work for you." },
  { num: "03", title: "Hit the Road", desc: "Confirm your booking and start your journey." },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <img src={heroImage} alt="Luxury car" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-gradient absolute inset-0" />
        <div className="container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <h1 className="mb-6 text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Drive Your Dream Car{" "}
              <span className="text-accent">Today</span>
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/80 sm:text-xl">
              Premium car rentals with seamless booking. From economy to exotic — find the perfect ride for every occasion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="accent" size="lg" asChild>
                <Link to="/cars">
                  Browse Fleet <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="accent-outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Why Choose DriveFleet</h2>
            <p className="text-muted-foreground">The smarter way to rent premium vehicles.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-xl bg-card p-6 card-shadow text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to get on the road.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <span className="mb-4 inline-block text-5xl font-black text-accent/20">{s.num}</span>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-12 text-center text-primary-foreground">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-primary-foreground/80">
              Join thousands of drivers who trust DriveFleet for their car rental needs.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/register">Start Renting Now</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
