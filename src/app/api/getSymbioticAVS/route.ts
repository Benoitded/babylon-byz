// src/app/api/getFinalityProviders/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import { VaultsRaw } from "@/app/types/vaultsData";
import { vaultsData } from "@/data/dataVaults";
import { supabase } from "@/lib/supabaseClient";
import { SymbioticAVSfromSupabase, PoSChain } from "@/app/types/vaultsData";

export async function GET(request: Request) {
  try {
    let { data: list_avs_symbiotic, error } = await supabase
      .from("list_avs_symbiotic")
      .select("address, image_url, name, description, apy, total_stake");
    console.log(list_avs_symbiotic);
    const formattedVaults: PoSChain[] =
      list_avs_symbiotic?.map((avs) => ({
        address: avs.address,
        name: avs.name,
        description: avs.description,
        apy: avs.apy,
        commission: 0,
        total_stake: avs.total_stake,
        image_url: avs.image_url,
        protocol: "Symbiotic",
      })) || [];

    console.log(formattedVaults);
    const jsonResponse = NextResponse.json(formattedVaults);
    jsonResponse.headers.set("Cache-Control", "no-store, max-age=0");
    return jsonResponse;
  } catch (error) {
    console.error("Error during the fetching of vaults:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
