import { OKXUniversalConnectUI } from "@okxconnect/ui";
import { THEME } from "@okxconnect/ui";
import { OKXBtcProvider } from "@okxconnect/universal-provider";

export const okxUniversalConnectUI = OKXUniversalConnectUI.init({
  dappMetaData: {
    icon: "https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png",
    name: "OKX WalletConnect UI Demo",
  },
  actionsConfiguration: {
    returnStrategy: "tg://resolve",
    modals: "all",
  },
  language: "en_US",
  uiPreferences: {
    theme: THEME.LIGHT,
  },
});

export const session = await (
  await okxUniversalConnectUI
).connect({
  namespaces: {
    btc: {
      chains: ["btc:mainnet", "fractal:mainnet"],
    },
  },
  sessionConfig: {
    redirect: "tg://resolve",
  },
});

(async () => {
  let okxBtcProvider = new OKXBtcProvider(await okxUniversalConnectUI);

  let result = await okxBtcProvider.getAccount("btc:mainnet");

  console.log(result);
})();
