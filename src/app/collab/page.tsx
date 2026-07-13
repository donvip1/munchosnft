import type { Metadata } from "next";

import { CollabPage } from "@/components/collab/CollabPage";

export const metadata: Metadata = {
  title: "Collab Application",
  description:
    "Apply to collaborate with Munchos NFT across Web3, NFT, creator, marketplace, media, and Robinhood Chain ecosystem opportunities."
};

export default function CollaborationPage() {
  return <CollabPage />;
}
