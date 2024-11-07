// src/app/api/getFinalityProviders/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import { VaultsRaw } from "@/app/types/vaultsData";
import { vaultsData } from "@/data/dataVaults";

export async function GET(request: Request) {
  try {
    const responseData: VaultsRaw[] = vaultsData;
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error during the fetching of vaults:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
