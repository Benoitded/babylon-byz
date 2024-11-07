import { NextResponse } from "next/server";
import axios from "axios";
import { ConsumerChainFromAPI, PoSChain } from "@/app/types/vaultsData";

// expor

export async function GET(request: Request) {
  try {
    const response = await axios.get(
      "https://staking-api.testnet.babylonchain.io/v1/finality-providers?pagination_key=&name="
    );

    const data: ConsumerChainFromAPI[] = response.data.data;

    const responseData: PoSChain[] = data.map((consumerChain) => ({
      address: consumerChain.btc_pk,
      name: consumerChain.description.moniker,
      description: consumerChain.description.details,
      apy: 0.1246,
      commission: parseFloat(consumerChain.commission),
      total_stake: consumerChain.total_tvl,
      protocol: "Babylon",
    }));
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error during the fetching of consumer chains:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
