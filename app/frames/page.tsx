import type { Metadata } from "next";
import FramesGallery from "@/components/frames/FramesGallery";

export const metadata: Metadata = {
  title: "THE COLLECTION",
  description:
    "Every framed anime piece on the wall, pulled into the light. Premium archival prints in shadow-box frames. Claim yours before it returns to the void.",
};

export default function FramesPage() {
  return <FramesGallery />;
}
