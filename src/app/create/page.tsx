"use client";

// @/src/app/avs/basket/page.tsx
import React, { useEffect, useRef, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Tooltip } from "@nextui-org/react";

import toast from "react-hot-toast";
import Lottie from "lottie-react";

import MainStruct from "@/app/components/MainStruct/MainStruct";
import { SpinnerPedro } from "@/utils/SpinnerPedro/SpinnerPedro";
import { useDataAVS, useLocalStorage } from "@/app/context/ContextProvider";
import {
  PoSChain,
  VaultToDisplay,
  SettingsCreateVault,
} from "@/app/types/vaultsData";
import ContentAVSsBasket from "@/app/components/ContentAVSsBasket/ContentAVSsBasket";
// import ContentSelectSettings from "@/app/components/ContentSelectSettings/ContentSelectSettings";
import ListPoSChain from "@/app/components/ListPoSChain/ListPoSChain";
import Blockies from "react-blockies";

import TrashIcon from "@/assets/icons/trash.svg";
import BabylonIcon from "@/assets/BabylonLogo.svg";
import SymbioticIcon from "@/assets/SymbioticLogo.svg";
import NoMailLottie from "@/assets/lottie/noMail.json";

import styles from "./page.module.scss";

// import Link from "next/link";
import { Link } from "next-view-transitions";
import { useWalletConnection } from "@/app/context/wallet/WalletConnectionProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import ContentSelectSettings from "@/app/components/ContentSelectSettings/ContentSelectSettings";

const DEFAULT_APY = 3.05;

function Page() {
  const { address, connected } = useBTCWallet();
  const { open } = useWalletConnection();

  const router = useTransitionRouter();
  const {
    dataPosChain,
    dataSymbioticAVS,
    refreshPosChain,
    refreshDataVaults,
    isLoadingVaults,
  } = useDataAVS();
  const { avsInBasket, removeFromLocal, updateLocalStateWithNewValue } =
    useLocalStorage();

  const [strat, setStrat] = useState<VaultToDisplay | null>(null);
  const [avsToAdd, setAVStoAdd] = useState<PoSChain[]>([]);
  const [avsToRemove, setAVStoRemove] = useState<PoSChain[]>([]);
  const [existingStrat, setExistingStrat] = useState<VaultToDisplay | null>(
    null
  );
  const [closestStrat, setClosestStrat] = useState<VaultToDisplay | null>(null);
  const [basketAVS, setBasketAVS] = useState<PoSChain[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentAPY, setCurrentAPY] = useState(DEFAULT_APY);
  const [stepCreate, setStepCreate] = useState(0);

  const [settings, setSettings] = useState<SettingsCreateVault>({
    name: "",
    description: "",
    curatorName: "",
  });

  // Ajouter un nouveau state
  const [isCreating, setIsCreating] = useState(false);

  const handleRemoveFromBasket = (avs: PoSChain) => {
    removeFromLocal("avsInBasket", avs.address);
    toast(`${avs.name} removed from AVS strategy`, {
      icon: "🗑️",
    });
  };

  useEffect(() => {
    setCurrentAPY(
      DEFAULT_APY + basketAVS.reduce((acc, avs) => acc + avs.apy, 0)
    );
  }, [basketAVS]);

  function handleContinue() {
    console.log("Continue");
    setStepCreate(1);
  }

  function handleBack() {
    setStepCreate(0);
  }

  const addVault = async (vaultData: any) => {
    try {
      const response = await fetch("/api/addRawVault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vaultData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'ajout du vault");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Erreur:", error);
      throw error;
    }
  };

  async function handleCreateVault() {
    console.log("Create vault");

    const uuid = crypto.randomUUID();

    const posChains = basketAVS.map((avs) => avs.address);
    const symbioticAVS = basketAVS.filter(
      (avs) => avs.protocol === "Symbiotic"
    );

    const newVaultData = {
      // Required: The name of the vault
      id: uuid,
      name: settings.name,
      description: settings.description,
      total_stake: 0,
      apy: currentAPY,
      pos_chains: posChains,
      avs_symbiotic: symbioticAVS,
    };
    const toastId = toast.loading("Creating vault...");
    const newVault = await addVault(newVaultData);
    if (newVault) {
      refreshDataVaults();
      setTimeout(() => {
        toast.success("Vault created!", { id: toastId });
        setTimeout(() => {
          router.push(`/vault/${uuid}`);
        }, 1000);
      }, 1000);
    } else {
      toast.error("Error during the creation of the vault", { id: toastId });
    }
  }
  useEffect(() => {
    console.log("avsInBasket", avsInBasket);
    if (dataPosChain.length > 0 || dataSymbioticAVS.length > 0) {
      setBasketAVS(
        avsInBasket
          .map(
            (avs) =>
              dataPosChain.find((avsData) => avsData.address === avs) ||
              dataSymbioticAVS.find((avsData) => avsData.address === avs)
          )
          .filter((avs) => avs !== undefined) as PoSChain[]
      );
    }
  }, [avsInBasket, dataPosChain, dataSymbioticAVS]);

  return (
    <MainStruct isLoading={false}>
      <section className={styles.firstSection}>
        <div className={styles.mainInfo}>
          {/* Tittle, tags, numbers, description */}
          <div className={styles.title}>
            {stepCreate === 0 ? (
              <h1 title={"Pick the finality provider"}>
                Pick the finality provider
              </h1>
            ) : stepCreate === 1 ? (
              <h1 title={"Pick the AVS"}>Pick the Symbiotic AVS</h1>
            ) : stepCreate === 2 ? (
              <h1 title={"Select the settings"}>Select the settings</h1>
            ) : (
              <h1 title={"Create the vault"}>Create the vault</h1>
            )}
          </div>
          {/* <div className={styles.tags}>
            <div className={styles.tag}>ETH</div>
            <div className={styles.tag}>
              <EigenLayerIcon />
            </div> */}
          {/* <ListPoSChain avsList={specificDataAVS.AVS} /> */}
          {/* <Link
              href={`https://etherscan.io/address/${specificDataAVS.address}`}
              target="_blank"
            >
              <OpenIcon />
            </Link> */}
          {/* </div> */}
          <div className={styles.description}>
            This is a new magic vault. Pick some AVS and create your own
            strategy!
          </div>
          <div className={styles.numbers}>
            {/* <div className={styles.number}>
              <span className={styles.numberValue}>
                ${specificDataAVS.total_staked.toFixed(0)}
              </span>
              <span className={styles.numberUnit}>M</span>
              <span className={styles.numberLabel}>TVL</span>
            </div> */}
            <div className={styles.number}>
              <span className={styles.numberValue}>
                {currentAPY.toFixed(2)}
              </span>
              <span className={styles.numberUnit}>%</span>
              <span className={styles.numberLabel}>Yield</span>
            </div>
          </div>
        </div>

        <div className={styles.containerBasket}>
          <div className={styles.label}>AVS basket</div>
          <div className={styles.containerAVSs}>
            {basketAVS && basketAVS.length > 0 ? (
              basketAVS.map((avs, index) => (
                <div key={index} className={styles.lineAVS}>
                  <div className={styles.divImg}>
                    {avs.image_url ? (
                      <img src={avs.image_url} alt={avs.name} />
                    ) : (
                      <Blockies seed={avs.address} />
                    )}
                    <div className={styles.protocolIcon}>
                      {avs.protocol === "Babylon" ? (
                        <BabylonIcon width={12} height={12} />
                      ) : (
                        <SymbioticIcon width={12} height={12} />
                      )}
                    </div>
                  </div>
                  <div>{avs.name}</div>
                  <div
                    className={styles.trashIcon}
                    onClick={() => handleRemoveFromBasket(avs)}
                  >
                    <TrashIcon />
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noAVS}>
                <Lottie
                  animationData={NoMailLottie}
                  style={{ width: "100px", height: "100px" }}
                />
                <div>No AVS in basket</div>
              </div>
            )}
          </div>

          {stepCreate === 0 ? (
            <button
              className={styles.restakeBtn}
              onClick={() => setStepCreate(1)}
              disabled={basketAVS.length === 0}
            >
              Continue with Symbiotic
            </button>
          ) : stepCreate === 1 ? (
            <div className={styles.containerButtons}>
              <button
                className={`${styles.restakeBtn} ${styles.backBtn}`}
                onClick={handleBack}
              >
                back
              </button>
              <button
                className={styles.restakeBtn}
                onClick={() => setStepCreate(2)}
                disabled={basketAVS.length === 0}
              >
                Continue with settings
              </button>
            </div>
          ) : (
            <div className={styles.containerButtons}>
              <button
                className={`${styles.restakeBtn} ${styles.backBtn}`}
                onClick={handleBack}
              >
                back
              </button>
              {!connected ? (
                <button className={styles.restakeBtn} onClick={() => open()}>
                  Connect wallet
                </button>
              ) : isCreating ? (
                <button className={styles.restakeBtn} disabled>
                  <SpinnerPedro size={0.6} />
                </button>
              ) : settings.name === "" ? (
                <button className={styles.restakeBtn} disabled>
                  Please enter a name
                </button>
              ) : settings.description === "" ? (
                <button className={styles.restakeBtn} disabled>
                  Please enter a description
                </button>
              ) : (
                <button
                  className={styles.restakeBtn}
                  onClick={handleCreateVault}
                >
                  Create
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      <section className={styles.secondSection}>
        {stepCreate === 0 ? (
          <ContentAVSsBasket
            protocol="Babylon"
            isSearchBar
            isLoading={isLoadingVaults}
          />
        ) : stepCreate === 1 ? (
          <ContentAVSsBasket
            protocol="Symbiotic"
            isSearchBar
            isLoading={isLoadingVaults}
          />
        ) : (
          <ContentSelectSettings
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </section>
    </MainStruct>
  );
}

export default Page;
