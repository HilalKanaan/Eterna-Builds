"use client";

import { useState } from "react";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import RoomAssembly from "@/components/sections/RoomAssembly";
import Services from "@/components/sections/Services";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollGuide from "@/components/ui/ScrollGuide";
import CompanyProfileModal from "@/components/ui/CompanyProfileModal";

export default function Home() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <main>
      <Navbar onOpenProfile={() => setProfileOpen(true)} />
      <ScrollGuide />
      <Hero />
      <About />
      <RoomAssembly />
      <Services />
      <Footer />
      <CompanyProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </main>
  );
}
