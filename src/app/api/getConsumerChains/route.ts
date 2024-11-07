import { NextResponse } from "next/server";
import axios from "axios";
import { ConsumerChainFromAPI, PoSChain } from "@/app/types/vaultsData";

// export interface PoSChain {
//   address: string;
//   name: string;
//   description?: string;
//   apy: number;
//   total_stake: number;
// }

// fetch("https://staking-api.testnet.babylonchain.io/v1/finality-providers?pagination_key=&name=", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,zh-CN;q=0.6,zh;q=0.5",
//     "if-modified-since": "Wed, 06 Nov 2024 17:12:23 GMT",
//     "priority": "u=1, i",
//     "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "cross-site",
//     "Referer": "http://localhost:3000/",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": null,
//   "method": "GET"
// });

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
