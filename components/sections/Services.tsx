import ServiceDrawer, { ServiceItem } from "@/components/ui/ServiceDrawer";

const OUR_SERVICES: ServiceItem[] = [
  {
    number: "01",
    title: "Design",
    tag: "Creative Direction",
    description:
      "From concept to the finest detail — crafting spaces that speak your language.",
    image: "/images/service-01-design.webp",
  },
  {
    number: "02",
    title: "Project Management & Consultancy",
    tag: "Strategic Oversight",
    description:
      "End-to-end ownership from first brief to final handover, on time and on vision.",
    image: "/images/service-02-management.webp",
  },
  {
    number: "03",
    title: "Supervision",
    tag: "Quality Control",
    description:
      "On-site expertise ensuring every standard, specification, and finish is met.",
    image: "/images/service-03-supervision.webp",
  },
  {
    number: "04",
    title: "Execution & Contracting",
    tag: "Built to Last",
    description:
      "Precision construction with premium craftsmanship at every stage.",
    image: "/images/service-04-execution.webp",
  },
];

const WHAT_WE_DO: ServiceItem[] = [
  {
    number: "01",
    title: "Earth Works & Landscaping",
    tag: "Foundation First",
    description:
      "Site preparation and outdoor environments that ground the vision before walls rise.",
    image: "/images/work-01-earthworks.webp",
  },
  {
    number: "02",
    title: "Concrete & Structural Works",
    tag: "Structural Integrity",
    description:
      "Robust frameworks engineered to endure for generations.",
    image: "/images/work-02-concrete.webp",
  },
  {
    number: "03",
    title: "MEP Building Systems",
    tag: "Smart Infrastructure",
    description:
      "Mechanical, electrical, and plumbing systems engineered for efficiency and longevity.",
    image: "/images/work-03-mep.webp",
  },
  {
    number: "04",
    title: "Interior Finishing & Fit-outs",
    tag: "Surface Excellence",
    description:
      "Premium materials and finishes that define the character of every space.",
    image: "/images/work-04-interior.webp",
  },
  {
    number: "05",
    title: "Furniture & More",
    tag: "Complete Living",
    description:
      "Curated furnishing and accessory selections that complete every interior story.",
    image: "/images/work-05-furniture.webp",
  },
];

export default function Services() {
  return (
    <>
      <ServiceDrawer
        id="services"
        label="What We Offer"
        title="Our Services"
        items={OUR_SERVICES}
        theme="dark"
      />
      <ServiceDrawer
        id="work"
        label="Our Capabilities"
        title="What We Do"
        items={WHAT_WE_DO}
        theme="forest"
        reverse
      />
    </>
  );
}
