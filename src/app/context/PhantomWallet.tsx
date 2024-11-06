"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface PhantomWalletContextProps {
  address: string | null;
  isConnected: boolean;
  isPhantomInstalled: boolean;
  balance: number | null;
  open: () => Promise<void>;
  disconnect: () => void;
}

const PhantomWalletContext = createContext<PhantomWalletContextProps>({
  address: null,
  isConnected: false,
  isPhantomInstalled: false,
  balance: null,
  open: async () => {},
  disconnect: () => {},
});

// const PhantomWalletContext = createContext<
//   PhantomWalletContextType | undefined
// >(undefined);

export function PhantomWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<any>(null);

  // Initialisation du provider
  useEffect(() => {
    if (typeof window !== "undefined") {
      const phantomProvider = (window as any).phantom?.bitcoin;
      if (phantomProvider?.isPhantom) {
        setProvider(phantomProvider);

        // Vérifier si déjà connecté
        phantomProvider
          .requestAccounts()
          .then((accounts: any[]) => {
            if (accounts[0]) {
              setAddress(accounts[0].address);
              setIsConnected(true);
            }
          })
          .catch((error: any) => {
            console.log("Non connecté initialement");
          });

        // Écouter les changements de compte
        phantomProvider.on("accountsChanged", (accounts: any[]) => {
          console.log("Accounts changed:", accounts);
          if (accounts.length > 0) {
            setAddress(accounts[0].address);
            setIsConnected(true);
          } else {
            // Tentative de reconnexion si le compte n'est pas connecté
            phantomProvider
              .requestAccounts()
              .then((newAccounts: any[]) => {
                if (newAccounts[0]) {
                  setAddress(newAccounts[0].address);
                  setIsConnected(true);
                }
              })
              .catch((error: any) => {
                setAddress(null);
                setIsConnected(false);
              });
          }
        });
      }
    }

    // Cleanup
    return () => {
      if (provider) {
        provider.removeAllListeners("accountsChanged");
      }
    };
  }, []);

  const open = async () => {
    console.log("open");
    try {
      if (!provider) {
        window.open("https://phantom.app/", "_blank");
        return;
      }
      const accounts = await provider.requestAccounts();
      console.log("accounts", accounts);
      if (accounts[0]) {
        setAddress(accounts[0].address);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
    }
  };

  // Note: selon la doc, on ne peut pas déconnecter programmatiquement
  // On peut seulement réinitialiser notre état local
  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
  };

  return (
    <PhantomWalletContext.Provider
      value={{
        address,
        isConnected,
        isPhantomInstalled: !!provider,
        balance: null, // Gardé pour la compatibilité de l'interface
        open,
        disconnect,
      }}
    >
      {children}
    </PhantomWalletContext.Provider>
  );
}

export function usePhantomWallet() {
  const context = useContext(PhantomWalletContext);
  if (context === undefined) {
    throw new Error(
      "usePhantomWallet doit être utilisé dans un PhantomWalletProvider"
    );
  }
  return context;
}

// export const usePhantomWallet = () => useContext(PhantomWalletContext);
