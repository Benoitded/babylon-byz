import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Vérification des champs requis
    const requiredFields = ["txHash", "address_receiver", "avs_symbiotic"];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `The field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Préparation des données à insérer
    const dataToStore = {
      txHash: body.txHash,
      address_receiver: body.address_receiver,
      avs_symbiotic: body.avs_symbiotic,
    };

    // Insertion dans la base de données
    const { data, error } = await supabase
      .from("list_symbiotic_rewards_receiver")
      .insert([dataToStore])
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
