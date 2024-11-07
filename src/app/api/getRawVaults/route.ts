// src/app/api/getFinalityProviders/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import { VaultsRaw } from "@/app/types/vaultsData";
import { vaultsData } from "@/data/dataVaults";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  try {
    const responseData: VaultsRaw[] = vaultsData;

    let { data: list_vaults_babylon, error } = await supabase
      .from("list_vaults_babylon")
      .select(
        "id, created_at, name,description,total_stake,apy,pos_chains,avs_symbiotic"
      );
    const formattedVaults = list_vaults_babylon?.map((vault) => ({
      address: vault.id,
      timestamp: new Date(vault.created_at).getTime(), // format timestamp
      name: vault.name,
      description: vault.description,
      total_stake: vault.total_stake,
      apy: vault.apy,
      pos_chains: vault.pos_chains,
      avs_symbiotic: vault.avs_symbiotic,
    }));

    console.log(formattedVaults);
    const jsonResponse = NextResponse.json(formattedVaults);
    jsonResponse.headers.set("Cache-Control", "no-store, max-age=0");
    return jsonResponse;
  } catch (error) {
    console.error("Error during the fetching of vaults:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
