import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import RoomAssembly from "@/components/sections/RoomAssembly";
import Gallery from "@/components/sections/Gallery";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <RoomAssembly />
      <Gallery />
      <Footer />
    </main>
  );
}
