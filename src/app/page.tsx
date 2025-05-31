// src/app/page.tsx
import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Features />
        <Testimonials />
      </main>
      
    </>
  );
}