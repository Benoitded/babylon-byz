// src/app/api/getFinalityProviders/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import { FinalityProviderFromAPI, PoSChain } from "@/app/types/vaultsData";

export async function GET(request: Request) {
  try {
    const response = await axios.get(
      "https://lcd-euphrates.devnet.babylonlabs.io/babylon/btcstaking/v1/finality_providers"
    );

    const data: FinalityProviderFromAPI[] = response.data.finality_providers;

    const responseData: PoSChain[] = data.map((finalityProvider) => ({
      address: finalityProvider.btc_pk,
      name: finalityProvider.description.moniker,
      apy: 0.2061,
      commission: parseFloat(finalityProvider.commission),
      total_stake: 0,
      image_url:
        "https://corzzzxuybbykevxkokz.supabase.co/storage/v1/object/public/global/logoBabylon.jpg",
      protocol: "Babylon",
    }));
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error during the fetching of finality providers:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
