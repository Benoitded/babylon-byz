// src/data/dataVaults.ts

import { VaultsRaw } from "@/app/types/vaultsData";

export const vaultsData: VaultsRaw[] = [
  {
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    name: "Vault 1",
    description:
      "First vault, offering optimal security and growth for your digital assets.",
    total_stake: 113.9,
    apy: 5.5,
    restaking_protocol: ["Babylon"],
    pos_chains: [
      "50e7eb0b83f31136a97c7edeb8d5acce7b42746149c21d1d55f5c8d1b2a962d2", // Babylon Foundation 3"
      "f4940b238dcd00535fde9730345bab6ff4ea6d413cc3602c4033c10f251c7e81",
      "7b82e0df503a6d220c54faf4c9803b5514b3d3df41a5158570f88d49f8533654",
      "a1498c8970d5de57623f060b5e032da701ed770cb57a5ce17f1a21d1487ce0dd",
      "17d33e18ab85b33050c763a44d8757dfe4e0a3c49e12911f65e0529c3cd224b6",
    ],
    avs_symbiotic: [],
    timestamp: 1627849200,
    hash: "abc123",
  },
  {
    address: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT",
    name: "Vault 2",
    description:
      "The second vault provides exceptional security measures and significant growth potential for your digital assets. It is designed to ensure the safety of your investments while maximizing returns through advanced restaking protocols and strategic asset management.",
    total_stake: 245.1,
    apy: 6.0,
    restaking_protocol: ["Symbiotic"],
    pos_chains: [
      "609e04a629f86d4eae4bd2ba3db9206739054a6696706f84ca1c6ad688872eb1", // Babylon Foundation 4"
      "13d16cebc8d998efb5aa94d46a449ae2e0ebb29947922185a218eeda1788c52a",
      "353c7d4f849495bf68a61812c4c3478b2526ca6c67d52e8118ad40065146f038",
      "1f29b05c07dce241310eaa3dbdb5315dfb1977fbc06284244f4d85c7d77836b1",
      "bef341a7adb10213a7ec7825afeb7d57fbfa7b5f7bdf201204fb0ef62fb9cfa6",
      "57a37bc99645a6d0756a293dde174c5bf007612eb02887d07220f1937c65e5e1",
      "3862a06f75cc707729588eddb85119fdae37404f879a9a90f545f54ab531531b",
    ],
    avs_symbiotic: [],
    timestamp: 1627849300,
    hash: "def456",
  },
];
