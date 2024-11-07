"use client";

import Image from "next/image";
import styles from "./page.module.scss";
import { Link } from "next-view-transitions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MainStruct from "@/app/components/MainStruct/MainStruct";
// import ContentVaults from "@/app/components/ContentVaults/ContentVaults";
import OpenIcon from "@/assets/icons/open.svg";

import { BTC_PRICE, useDataAVS } from "@/app/context/ContextProvider";
import ContentVaults from "@/app/components/ContentVaults/ContentVaults";
import FullBabylonLogo from "@/assets/fullBabylonLogo.svg";

import { VaultToDisplay } from "@/app/types/vaultsData";
import ListPoSChain from "@/app/components/ListPoSChain/ListPoSChain";
import RestakeApp from "@/app/components/RestakeApp/RestakeApp";
import ContentPoSChains from "@/app/components/ContentPoSChains/ContentPoSChains";

export default function Home() {
  const params = useParams();
  const id = params.id as string;
  const { dataVaults, isLoadingVaults } = useDataAVS();
  const [specificVault, setSpecificVault] = useState<
    VaultToDisplay | undefined
  >(dataVaults.find((e) => e.address.toLowerCase() === id.toLowerCase()));

  useEffect(() => {
    setSpecificVault(
      dataVaults.find((e) => e.address.toLowerCase() === id.toLowerCase())
    );
  }, [dataVaults, id]);

  return (
    <MainStruct isBackButton isLoading={isLoadingVaults}>
      {specificVault ? (
        <>
          <section className={styles.firstSection}>
            <div className={styles.mainInfo}>
              {/* Tittle, tags, numbers, description */}
              <div className={styles.title}>
                <h1
                  style={{
                    viewTransitionName: "name-strategy-avs-" + id.toLowerCase(),
                  }}
                  title={specificVault.name}
                >
                  {specificVault.name ? specificVault.name : "No name vault"}
                </h1>
              </div>
              <div className={styles.tags}>
                <div className={styles.tag}>ETH</div>
                <div className={styles.tag}>
                  {/* <EigenLayerIcon /> */}
                  <FullBabylonLogo />
                </div>
                {/* <div className={styles.tag}>
                  by{" "}
                  <AddressLink
                    address={specificVault.creator}
                    isShort
                    showYourAddress={false}
                    isDisplayIcone={false}
                    numberDigits={3}
                  />
                </div> */}
                <ListPoSChain avsList={specificVault.pos_chains} />
                <Link
                  href={`https://mempool.space/signet/tx/${specificVault.hash}`}
                  target="_blank"
                >
                  <OpenIcon />
                </Link>
              </div>
              <div className={styles.numbers}>
                <div className={styles.number}>
                  <span className={styles.numberValue}>
                    $
                    {(
                      (BTC_PRICE * Number(specificVault.total_stake)) /
                      1e6
                    ).toFixed(2)}
                  </span>
                  <span className={styles.numberUnit}>M</span>
                  <span className={styles.numberLabel}>TVL</span>
                </div>
                <div className={styles.number}>
                  <span className={styles.numberValue}>
                    {specificVault.apy.toFixed(2)}
                  </span>
                  <span className={styles.numberUnit}>%</span>
                  <span className={styles.numberLabel}>Yield</span>
                </div>
              </div>
              <div className={styles.description}>
                {specificVault.description}
              </div>
            </div>
            <RestakeApp
              contractAddress={specificVault.address}
              finalityProviderPK={[""]}
            />
          </section>
          <ContentPoSChains
            posChainList={specificVault.pos_chains}
            isSearchBar
          />
        </>
      ) : (
        <div className={styles.problem}>
          <h1>Vault not found</h1>
          <Link href={`/`}>Back to the list</Link>
        </div>
      )}
      {/* <ContentVaults
        title="Public vaults"
        listVaults={dataVaults}
        isSearchBar
        isCreateVaultButton
        isLoading={isLoadingVaults}
      /> */}
    </MainStruct>
  );
}
