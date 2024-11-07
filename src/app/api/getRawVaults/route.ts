// src/app/api/getFinalityProviders/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import { VaultsRaw } from "@/app/types/vaultsData";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  try {
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
    const response = NextResponse.json(formattedVaults);

    // Ajout d'en-têtes plus stricts pour le cache
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");

    return response;
  } catch (error) {
    console.error("Error during the fetching of vaults:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
