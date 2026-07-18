import { createConfig, http, injected } from "wagmi";
import { defineChain, type Address } from "viem";

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.chain.robinhood.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Robinhood Testnet Explorer",
      url: "https://explorer.testnet.chain.robinhood.com"
    }
  },
  testnet: true
});

export const genesisContractAddress = (
  process.env.NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS ??
  "0xf049D304746b5d05AC321B8c997BBe53CcDbf103"
) as Address;

export const fusionContractAddress = (
  process.env.NEXT_PUBLIC_FUSION_CONTRACT_ADDRESS ??
  "0x18c480C9De6BA3088bAaAC19c1d73241dBaeA939"
) as Address;

export const fusedMetadataUrl =
  process.env.NEXT_PUBLIC_FUSED_METADATA_URL ?? "/api/testnet-fusion-metadata/1.json";

export const genesisAbi = [
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address" }]
  },
  {
    type: "function",
    name: "isApprovedForAll",
    stateMutability: "view",
    inputs: [{ type: "address" }, { type: "address" }],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "setApprovalForAll",
    stateMutability: "nonpayable",
    inputs: [{ type: "address" }, { type: "bool" }],
    outputs: []
  },
  {
    type: "function",
    name: "salePhase",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }]
  },
  {
    type: "function",
    name: "totalMinted",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "teamMinted",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "MAX_SUPPLY",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "TEAM_RESERVE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "gtdMerkleRoot",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }]
  },
  {
    type: "function",
    name: "whitelistMerkleRoot",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }]
  },
  {
    type: "function",
    name: "GTD_PRICE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "WHITELIST_PRICE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "PUBLIC_PRICE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "mintedInPhase",
    stateMutability: "view",
    inputs: [{ type: "address" }, { type: "uint8" }],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "mintGTD",
    stateMutability: "payable",
    inputs: [{ type: "bytes32[]" }],
    outputs: []
  },
  {
    type: "function",
    name: "mintWhitelist",
    stateMutability: "payable",
    inputs: [{ type: "bytes32[]" }],
    outputs: []
  },
  {
    type: "function",
    name: "mintPublic",
    stateMutability: "payable",
    inputs: [],
    outputs: []
  }
] as const;

export const fusionAbi = [
  {
    type: "function",
    name: "fuse",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenIdA", type: "uint256" }, { name: "tokenIdB", type: "uint256" }],
    outputs: [{ name: "fusedTokenId", type: "uint256" }]
  }
] as const;

export const web3Config = createConfig({
  chains: [robinhoodTestnet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [robinhoodTestnet.id]: http(robinhoodTestnet.rpcUrls.default.http[0])
  },
  ssr: true
});
