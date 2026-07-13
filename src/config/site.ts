export const siteConfig = {
  name: "Munchos NFT",
  handle: "munchonft",
  xUrl: "https://x.com/munchonft",
  pinnedPostUrl:
    process.env.NEXT_PUBLIC_PINNED_X_POST_URL ??
    "https://x.com/i/status/2076332062122955242",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.munchosapp.xyz",
  chain: "Robinhood Chain",
  supportEmail: "munchonfts@gmail.com"
} as const;

export const pinnedPostId = "2076332062122955242";

export const waitlistTaskActions = [
  {
    id: "follow",
    title: `Follow @${siteConfig.handle}`,
    description: "Open the Munchos NFT profile and follow the project account.",
    actionLabel: "Open Profile",
    url: siteConfig.xUrl
  },
  {
    id: "post",
    title: "Make a post about Munchos",
    description: "Create a public X post about Munchos, then paste the post link in the form.",
    actionLabel: "Create Post",
    url: `https://x.com/intent/tweet?text=${encodeURIComponent(
      "Munchos NFT is building a Robinhood Chain-native app for NFT fusion, minting, evolution, rewards, and marketplace expansion."
    )}`
  },
  {
    id: "repost",
    title: "Repost the pinned post",
    description: "Open the repost action for the pinned Munchos NFT post.",
    actionLabel: "Repost",
    url: `https://x.com/intent/retweet?tweet_id=${pinnedPostId}`
  }
] as const;

export const futureFeatures = [
  {
    title: "NFT Mint",
    description: "Genesis access, allowlist minting, and chain-native mint sessions.",
    icon: "Sparkles"
  },
  {
    title: "NFT Fusion",
    description: "Fuse assets, lock or burn originals, and mint upgraded Munchos.",
    icon: "RefreshCw"
  },
  {
    title: "NFT Evolution",
    description: "Trait upgrades and rarity progression powered by smart contracts.",
    icon: "Dna"
  },
  {
    title: "Marketplace",
    description: "Collection discovery and trading designed for Robinhood Chain NFTs.",
    icon: "Store"
  },
  {
    title: "Rewards",
    description: "Community quests, contributor incentives, and loyalty mechanics.",
    icon: "Trophy"
  },
  {
    title: "Staking",
    description: "Stake future assets for ecosystem rewards and status tiers.",
    icon: "Gem"
  },
  {
    title: "Leaderboard",
    description: "Rank collectors, contributors, fusion activity, and event performance.",
    icon: "BarChart3"
  },
  {
    title: "Wallet Dashboard",
    description: "Portfolio, owned NFTs, activity, rewards, and chain status in one view.",
    icon: "Wallet"
  },
  {
    title: "User Profile",
    description: "Collector identity, badges, community history, and on-chain progress.",
    icon: "UserRound"
  },
  {
    title: "Collections",
    description: "Explore Munchos sets, traits, rarity classes, and evolution branches.",
    icon: "PanelsTopLeft"
  },
  {
    title: "Achievements",
    description: "Quest badges and future gameplay milestones for the community.",
    icon: "Medal"
  }
] as const;

export const roadmap = [
  {
    title: "Community Launch"
  },
  {
    title: "Chain Access"
  },
  {
    title: "Mint Layer"
  },
  {
    title: "Evolution Engine"
  },
  {
    title: "Ecosystem"
  }
] as const;
