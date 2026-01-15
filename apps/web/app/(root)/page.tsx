import { Hero } from "./components/hero"
import { Features } from "./components/features"
import { HowItWorks } from "./components/how-it-works"
import { FAQ } from "./components/faq"
import { CTA } from "./components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
