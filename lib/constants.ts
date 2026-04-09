export const BRAND = {
  name: "Eterna Builds",
  taglines: {
    hero: "Spaces that Understand you",
    about:
      "Driving bold construction projects to timeless spaces for modern living.",
    gallery: "Designed to Feel Right",
    process: "Built to Last",
  },
  contact: {
    lebanon: { label: "Lebanon", code: "🇱🇧", phone: "+961 3 665 002" },
    saudi: { label: "Saudi Arabia", code: "🇸🇦", phone: "+966 507 515 273" },
    facebook: "https://facebook.com/EternaBuilds",
    instagram: "https://www.instagram.com/eterna.builds/",
    linkedin: "https://www.linkedin.com/company/eterna-builds/posts/?feedView=all",
  },
} as const;

export const GALLERY_ITEMS = [
  {
    title: "Bedroom",
    image: "/images/bedroom.jpg",
    subtitle: "Restful Sanctuaries",
  },
  {
    title: "Living Room",
    image: "/images/living-room.jpg",
    subtitle: "Curated Comfort",
  },
  {
    title: "Kitchen",
    image: "/images/kitchen.jpg",
    subtitle: "Culinary Spaces",
  },
  {
    title: "Bathroom",
    image: "/images/bathroom.jpg",
    subtitle: "Serene Retreats",
  },
  {
    title: "Office",
    image: "/images/office.jpg",
    subtitle: "Productive Elegance",
  },
] as const;
