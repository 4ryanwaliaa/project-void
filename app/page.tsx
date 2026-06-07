import VoidExperience from "@/components/experience/VoidExperience";

// The homepage IS the room. Everything interactive lives inside the client experience;
// this server component just mounts it full-bleed.
export default function Home() {
  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-void-black">
      <VoidExperience />
    </main>
  );
}
