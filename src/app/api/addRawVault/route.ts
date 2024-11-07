import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Vérification des champs requis
    const requiredFields = [
      "name",
      "total_stake",
      "apy",
      "pos_chains",
      "avs_symbiotic",
    ];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `The field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Préparation des données à insérer
    const vaultData = {
      ...(body.id && { id: body.id }), // Ajoute l'ID seulement s'il est fourni
      name: body.name,
      description: body.description || null,
      total_stake: body.total_stake,
      apy: body.apy,
      pos_chains: body.pos_chains,
      avs_symbiotic: body.avs_symbiotic,
    };

    // Insertion dans la base de données
    const { data, error } = await supabase
      .from("list_vaults_babylon")
      .insert([vaultData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error during the addition of the vault:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
