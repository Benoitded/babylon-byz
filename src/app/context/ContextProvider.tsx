"use client";

// src/contexts/ContextProvider.tsx
import React, { createContext, useState, useEffect, useContext } from "react";

import { PoSChain, VaultsRaw, VaultToDisplay } from "@/app/types/vaultsData";

export const BTC_PRICE = 75175.66024;
export const RATIO = 1; // 1 ETH = 0.9934 byzETH
export const DEFAULT_APY = 3.25;

interface LocalStorageContextProps {
  avsInBasket: string[];
  favoritesAVS: string[];
  addToLocal: (where: "avsInBasket" | "favoritesAVS", address: string) => void;
  removeFromLocal: (
    where: "avsInBasket" | "favoritesAVS",
    address: string
  ) => void;
  toggleInLocal: (
    where: "avsInBasket" | "favoritesAVS",
    address: string
  ) => void;
  updateLocalStateWithNewValue: (
    where: "avsInBasket" | "favoritesAVS",
    address: string | string[]
  ) => void;
  isInLocal: (
    where: "avsInBasket" | "favoritesAVS",
    address: string
  ) => boolean;
}

interface DataAVSContextProps {
  dataPosChain: PoSChain[];
  dataSymbioticAVS: PoSChain[];
  refreshPosChain: () => void;
  dataVaults: VaultToDisplay[];
  refreshDataVaults: () => void;
  // dataTopStratAVS: VaultToDisplay[];
  // dataStratAVS: VaultToDisplay[];
  // refreshDataStratAVS: () => void;
  isLoadingVaults: boolean;
}

interface OpenStateContextProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBasketOpen: boolean;
  setIsBasketOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LocalStorageContext = createContext<LocalStorageContextProps>({
  avsInBasket: [],
  favoritesAVS: [],
  addToLocal: () => {},
  removeFromLocal: () => {},
  updateLocalStateWithNewValue: () => {},
  toggleInLocal: () => {},
  isInLocal: () => false,
});

const DataAVSContext = createContext<DataAVSContextProps>({
  dataPosChain: [],
  dataSymbioticAVS: [],
  refreshPosChain: () => {},
  dataVaults: [],
  refreshDataVaults: () => {},
  // dataTopStratAVS: [],
  // dataStratAVS: [],
  // refreshDataStratAVS: () => {},
  isLoadingVaults: true,
});

const OpenStateContext = createContext<OpenStateContextProps>({
  isMenuOpen: false,
  setIsMenuOpen: () => {},
  isBasketOpen: false,
  setIsBasketOpen: () => {},
});

interface ContextProviderProps {
  children: React.ReactNode;
}

export const ContextProvider: React.FC<ContextProviderProps> = ({
  children,
}) => {
  const [avsInBasket, setAvsInBasket] = useState<string[]>(() => {
    const storedBasket = localStorage.getItem("avsInBasket");
    return storedBasket ? JSON.parse(storedBasket) : [];
  });
  const [favoritesAVS, setFavoritesAVS] = useState<string[]>(() => {
    const storedFavorites = localStorage.getItem("favoritesAVS");
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });

  const [dataPosChain, setDataPosChain] = useState<PoSChain[]>([]);
  const [dataSymbioticAVS, setDataSymbioticAVS] = useState<PoSChain[]>([]);
  const [dataVaults, setDataVaults] = useState<VaultToDisplay[]>([]);
  const [isDataAVSLoaded, setIsDataAVSLoaded] = useState(false);
  const [isLoadingVaults, setIsLoadingVaults] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isPopSelectTokenOpen, setIsPopSelectTokenOpen] =
    useState<boolean>(false);

  const fetchPosChain = async () => {
    console.log("Going to fetch pos chain");
    try {
      const [responseFP, responseCC, responseSymbiotic] = await Promise.all([
        fetch("/api/getFinalityProviders"),
        fetch("/api/getConsumerChains"),
        fetch("/api/getSymbioticAVS"),
      ]);
      const dataFP = await responseFP.json();
      const dataCC = await responseCC.json();
      const data = [...dataFP, ...dataCC];
      console.log("Got pos chain data", data);
      setDataPosChain(data);

      const dataSymbiotic = await responseSymbiotic.json();
      console.log("Got symbiotic AVS data", dataSymbiotic);
      setDataSymbioticAVS(dataSymbiotic);

      fetchDataVaults(data, dataSymbiotic);

      return data;
    } catch (error) {
      console.error("Failed to fetch pos chain data:", error);
    }
  };

  useEffect(() => {
    if (!isDataAVSLoaded) {
      // fetchDataAVS();
      fetchPosChain();
      // fetchDataVaults();
    }
  }, [isDataAVSLoaded]);

  //promise qui renvoie un tableau de VaultToDisplay
  const fetchDataVaults = async (
    posChain: PoSChain[],
    symbioticAVS: PoSChain[]
  ): Promise<VaultToDisplay[]> => {
    console.log("Going to fetch vaults with posChain:", posChain);
    try {
      const response = await fetch("/api/getRawVaults");
      const data: VaultsRaw[] = await response.json();

      console.log("posChainRaw:", posChain);

      //on link les adresses qu'on a des poschain dans response de l'api avec posChain

      //promise qui renvoie un tableau de VaultToDisplay
      const dataToDisplay: VaultToDisplay[] = data.map((vault) => {
        console.log("-> For the vault:", vault);
        //get operator from dataOperators

        const posChainLinked = posChain.filter((pos) =>
          vault.pos_chains.includes(pos.address)
        );
        const symbioticAVSLinked = symbioticAVS.filter((symbiotic) =>
          vault.avs_symbiotic.includes(symbiotic.address)
        );

        const avgCommission =
          posChainLinked.reduce((sum, avs) => sum + (avs?.commission || 0), 0) /
          posChainLinked.length;
        console.log("posChainLinked", posChainLinked);

        // listAVStoDisplay pareil que listAVS mais au lieu d'avoir que un tableau de string, on récup tout la data AVStoDisplay avec les infos de dataAVS
        // const listAVStoDisplay = posChain.filter((avs) =>
        //   listAVS.some((avsList) => avsList.includes(avs.address))
        // );
        // console.log("listAVStoDisplay", listAVStoDisplay);

        const apy =
          posChainLinked.reduce((sum, avs) => sum + (avs?.apy || 0), 0) +
          DEFAULT_APY;
        console.log("apy", apy);

        return {
          ...vault,
          apy,
          pos_chains: posChainLinked,
          avs_symbiotic: symbioticAVSLinked,
          avg_commission: avgCommission,
          // total_stake: 0,
        };
      });
      console.log("dataToDisplay:", dataToDisplay);
      setDataVaults(dataToDisplay);
      setIsLoadingVaults(false);
      return dataToDisplay;
    } catch (error) {
      console.error("Failed to fetch vaults data:", error);
      return [];
    }
  };

  const stateSetters = {
    avsInBasket: setAvsInBasket,
    favoritesAVS: setFavoritesAVS,
  };

  const getStateByKey = (where: keyof typeof stateSetters): string[] => {
    switch (where) {
      case "avsInBasket":
        return avsInBasket;
      case "favoritesAVS":
        return favoritesAVS;
      default:
        return [];
    }
  };

  const updateLocalState = (
    where: keyof typeof stateSetters,
    updater: (prev: string[]) => string[]
  ) => {
    const currentState = getStateByKey(where);
    const updatedState = updater(currentState);
    stateSetters[where](updatedState);
    localStorage.setItem(where, JSON.stringify(updatedState));
  };

  const addToLocal = (
    where: keyof typeof stateSetters,
    address: string | string[]
  ) => {
    // if address is an array, we add each address
    if (Array.isArray(address)) {
      updateLocalState(where, (prev) => {
        return [...prev, ...address];
      });
    } else {
      updateLocalState(where, (prev) => {
        if (!prev.includes(address)) {
          return [...prev, address];
        }
        return prev;
      });
    }
  };

  const removeFromLocal = (
    where: keyof typeof stateSetters,
    address: string | string[]
  ) => {
    // if address is an array, we remove each address
    if (Array.isArray(address)) {
      updateLocalState(where, (prev) =>
        prev.filter((item) => !address.includes(item))
      );
    } else {
      updateLocalState(where, (prev) =>
        prev.filter((item) => item !== address)
      );
    }
  };

  const updateLocalStateWithNewValue = (
    where: keyof typeof stateSetters,
    address: string | string[]
  ) => {
    if (!Array.isArray(address)) {
      address = [address];
    }
    updateLocalState(where, (prev) => {
      return address;
    });
  };

  const toggleInLocal = (where: keyof typeof stateSetters, address: string) => {
    const isInList = getStateByKey(where).includes(address);

    if (isInList) {
      removeFromLocal(where, address);
    } else {
      addToLocal(where, address);
    }
  };

  const isInLocal = (
    where: keyof typeof stateSetters,
    address: string
  ): boolean => {
    return getStateByKey(where).includes(address);
  };

  // const refreshDataAVS = () => {
  //   setIsDataAVSLoaded(false);
  //   fetchDataAVS();
  // };

  const refreshPosChain = () => {
    setIsDataAVSLoaded(false);
    fetchPosChain();
  };

  // const refreshDataStratAVS = () => {
  //   fetchDataStratAVS(dataAVS);
  //   console.log("Refresh data strat AVS");
  // };

  const refreshDataVaults = () => {
    fetchDataVaults(dataPosChain, dataSymbioticAVS);
    console.log("Refresh data vaults");
  };

  return (
    <LocalStorageContext.Provider
      value={{
        avsInBasket,
        favoritesAVS,
        addToLocal,
        removeFromLocal,
        toggleInLocal,
        isInLocal,
        updateLocalStateWithNewValue,
      }}
    >
      <DataAVSContext.Provider
        value={{
          dataPosChain,
          refreshPosChain,
          dataSymbioticAVS,
          dataVaults,
          refreshDataVaults,
          isLoadingVaults,
        }}
      >
        <OpenStateContext.Provider
          value={{
            isMenuOpen,
            setIsMenuOpen,
            isBasketOpen,
            setIsBasketOpen,
          }}
        >
          {children}
        </OpenStateContext.Provider>
      </DataAVSContext.Provider>
    </LocalStorageContext.Provider>
  );
};

// Custom hooks to use contexts
export const useLocalStorage = () => useContext(LocalStorageContext);
export const useDataAVS = () => useContext(DataAVSContext);
export const useOpenState = () => useContext(OpenStateContext);
