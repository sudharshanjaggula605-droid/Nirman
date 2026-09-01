import { ContactSection } from "@/components/contact-section";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Contact NIRMAN Support & Help Desk",
  description:
    "Report issues, submit inquiries, or request technical and billing assistance from NIRMAN support team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-10">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
