import {
  TomoContextProvider,
  useTomoModalControl,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoWalletState,
} from "@tomo-inc/wallet-connect-sdk";
import "@tomo-inc/wallet-connect-sdk/style.css";
import { useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
} from "react";

import { getNetworkConfig } from "@/config/network.config";

// We have to split the connection into two parts
// so we can use the tomoWalletConnect and tomoModal hooks
export const WalletConnectionProvider = ({ children }: PropsWithChildren) => {
  const { resolvedTheme } = useTheme();

  console.log("resolvedTheme:", resolvedTheme);

  const { mempoolApiUrl, network, networkName } = getNetworkConfig();
  const bitcoinChain = {
    id: 1,
    name: networkName,
    type: "bitcoin" as any,
    network: network,
    backendUrls: {
      mempoolUrl: mempoolApiUrl + "/api/",
    },
  };

  return (
    <TomoContextProvider
      bitcoinChains={[bitcoinChain]}
      chainTypes={["bitcoin"]}
      style={{
        rounded: "medium",
        theme: resolvedTheme as "dark" | "light",
        primaryColor: "#FF7C2A",
      }}
    >
      <WalletConnectionProviderInternal>
        {children}
      </WalletConnectionProviderInternal>
    </TomoContextProvider>
  );
};

interface WalletConnectionContextProps {
  open: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  providers: ReturnType<typeof useTomoProviders>;
  tomoWalletConnect: ReturnType<typeof useTomoWalletConnect>;
  tomoModal: ReturnType<typeof useTomoModalControl>;
  tomoWalletState: ReturnType<typeof useTomoWalletState>;
}

const WalletConnectionContext = createContext<WalletConnectionContextProps>({
  open: async () => {},
  disconnect: async () => {},
  isConnected: false,
  providers: {} as ReturnType<typeof useTomoProviders>,
  tomoWalletConnect: {} as ReturnType<typeof useTomoWalletConnect>,
  tomoModal: {} as ReturnType<typeof useTomoModalControl>,
  tomoWalletState: {} as ReturnType<typeof useTomoWalletState>,
});

const WalletConnectionProviderInternal = ({ children }: PropsWithChildren) => {
  const tomoModal = useTomoModalControl();
  const tomoWalletConnect = useTomoWalletConnect();
  const tomoWalletState = useTomoWalletState();
  const providers = useTomoProviders();

  const open = useCallback(async () => {
    console.log("Going to open the modal");
    await tomoModal.open("connect");
  }, [tomoModal]);

  const disconnect = useCallback(async () => {
    await tomoWalletConnect.disconnect();
  }, [tomoWalletConnect]);

  const isConnected = tomoWalletState.isConnected;

  return (
    <WalletConnectionContext.Provider
      value={{
        open,
        disconnect,
        isConnected,
        providers,
        tomoWalletConnect,
        tomoModal,
        tomoWalletState,
      }}
    >
      {children}
    </WalletConnectionContext.Provider>
  );
};

export const useWalletConnection = () => useContext(WalletConnectionContext);
