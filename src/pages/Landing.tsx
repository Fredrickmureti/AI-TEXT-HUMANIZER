import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CareerTools } from '@/components/landing/CareerTools';
import { Demo } from '@/components/landing/Demo';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <CareerTools />
      <Demo />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
