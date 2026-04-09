import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import RoomAssembly from "@/components/sections/RoomAssembly";
import Services from "@/components/sections/Services";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollGuide from "@/components/ui/ScrollGuide";

export default function Home() {
  return (
    <main>
      <Navbar />
      <ScrollGuide />
      <Hero />
      <About />
      <RoomAssembly />
      <Services />
      <Footer />
    </main>
  );
}
