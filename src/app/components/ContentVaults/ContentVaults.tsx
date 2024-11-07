// src/components/ContentVaults.tsx
import React, { useRef, useEffect, useState } from "react";
// import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";
import Image from "next/image";
import Lottie from "lottie-react";

import { SpinnerPedro } from "@/utils/SpinnerPedro/SpinnerPedro";
import EmptyLottie from "@/assets/lottie/empty.json";
// import EigenLayerIcon from "@/assets/brands/eigenlayer.svg";
// import ETH from "@/assets/tokens/ETH.png";
import BabylonIcon from "@/assets/BabylonLogo.svg";
import Bitcoin from "@/assets/bitcoin.svg";
import ArrowsOrderIcon from "@/assets/icons/arrowsOrder.svg";
import styles from "./ContentVaults.module.scss";

import { VaultToDisplay } from "@/app/types/vaultsData";
import ListPoSChain from "@/app/components/ListPoSChain/ListPoSChain";
import SearchBar from "./SearchBar/SearchBar";

import { BTC_PRICE } from "@/app/context/ContextProvider";

interface ContentVaultsProps {
  listVaults: VaultToDisplay[];
  title?: string;
  isSearchBar?: boolean;
  isCreateVaultButton?: boolean;
  button?:
    | false
    | {
        text?: string;
        onClick?: (event: React.MouseEvent) => void;
      };
  isLoading?: boolean;
}

function formatNumber(number: number): string {
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(2) + "B";
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(2) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(2) + "k";
  }
  return number.toFixed(2).toString();
}

type Order = "random" | "name" | "total_stake" | "apy" | "avs" | "commission";
type SortDirection = "asc" | "desc";

const ContentVaults: React.FC<ContentVaultsProps> = ({
  listVaults,
  title,
  isSearchBar,
  isCreateVaultButton,
  button,
  isLoading,
}) => {
  const router = useTransitionRouter();
  const [sortedVaults, setSortedVaults] =
    useState<VaultToDisplay[]>(listVaults);
  const [filteredVaults, setFilteredVaults] = useState<VaultToDisplay[]>(
    listVaults || []
  );
  const [currentOrder, setCurrentOrder] = useState<Order>("random");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Effet pour initialiser et trier les vaults
  useEffect(() => {
    if (listVaults) {
      sortVaults(listVaults, currentOrder, sortDirection);
      setSortedVaults(listVaults);
    }
  }, [listVaults, currentOrder, sortDirection]);

  // Effet pour filtrer les vaults triés
  useEffect(() => {
    const filtered = sortedVaults.filter((vault) =>
      vault.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("filtered", filtered);
    setFilteredVaults(filtered);
  }, [sortedVaults, searchTerm]);

  function sortVaults(
    vaults: VaultToDisplay[],
    order: Order,
    direction: SortDirection
  ) {
    const sortFunctions = {
      random: () => Math.random() - 0.5,
      name: (a: VaultToDisplay, b: VaultToDisplay) =>
        (a.name || "").localeCompare(b.name || ""),
      total_stake: (a: VaultToDisplay, b: VaultToDisplay) =>
        b.total_stake - a.total_stake,
      apy: (a: VaultToDisplay, b: VaultToDisplay) => b.apy - a.apy,
      avs: (a: VaultToDisplay, b: VaultToDisplay) =>
        b.pos_chains.length - a.pos_chains.length,
      commission: (a: VaultToDisplay, b: VaultToDisplay) =>
        b.avg_commission - a.avg_commission,
    };

    const sortFunction = sortFunctions[order];
    vaults.sort((a, b) => {
      const result = sortFunction(a, b);
      return direction === "asc" ? result : -result;
    });
  }

  function handleOrderChange(order: Order) {
    if (order === currentOrder) {
      // Si on clique sur le même ordre, on inverse la direction
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Si on change d'ordre, on réinitialise la direction à "asc"
      setCurrentOrder(order);
      setSortDirection("asc");
    }

    const newSortedVaults = [...sortedVaults];
    sortVaults(newSortedVaults, order, sortDirection);
    setSortedVaults(newSortedVaults);
  }

  function handleRestake(event: React.MouseEvent, address: string) {
    event.preventDefault();
    event.stopPropagation();

    router.push(`/vault/${address}`);
    // setIsPopRestakeOpen(address);
  }

  function handleCreateVault() {
    router.push("/create");
  }

  return (
    <div className={styles.contentVaults}>
      {(title || isSearchBar || isCreateVaultButton) && (
        <div className={styles.firstLine}>
          <div className={styles.leftFirstLine}>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <div className={styles.rightFirstLine}>
            {isSearchBar && (
              <SearchBar
                listVaults={sortedVaults || []}
                setFilteredListVaults={setFilteredVaults}
              />
            )}
            {isCreateVaultButton && (
              <button onClick={handleCreateVault}>Create vault</button>
            )}
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table>
          <tr className={`${styles.lineTab} ${styles.header}`}>
            <td
              className={`${styles.nameTab} ${
                currentOrder === "name"
                  ? sortDirection === "asc"
                    ? styles.asc
                    : styles.desc
                  : ""
              }`}
              onClick={() => handleOrderChange("name")}
            >
              Vault
              <ArrowsOrderIcon />
            </td>
            <td
              onClick={() => handleOrderChange("total_stake")}
              className={`${styles.totalStakeTab} ${
                currentOrder === "total_stake"
                  ? sortDirection === "asc"
                    ? styles.asc
                    : styles.desc
                  : ""
              }`}
            >
              Total Stake
              <ArrowsOrderIcon />
            </td>
            <td
              onClick={() => handleOrderChange("apy")}
              className={`${styles.apyTab} ${
                currentOrder === "apy"
                  ? sortDirection === "asc"
                    ? styles.asc
                    : styles.desc
                  : ""
              }`}
            >
              APY
              <ArrowsOrderIcon />
            </td>
            <td className={styles.restakingProtocolTab}>Restaking protocol</td>
            <td
              onClick={() => handleOrderChange("avs")}
              className={`${styles.avsTab} ${
                currentOrder === "avs"
                  ? sortDirection === "asc"
                    ? styles.asc
                    : styles.desc
                  : ""
              }`}
            >
              AVS
              <ArrowsOrderIcon />
            </td>
            <td
              onClick={() => handleOrderChange("commission")}
              className={`${styles.commissionTab} ${
                currentOrder === "commission"
                  ? sortDirection === "asc"
                    ? styles.asc
                    : styles.desc
                  : ""
              }`}
            >
              Commission
              <ArrowsOrderIcon />
            </td>

            {(button === undefined || button !== false) && (
              <td className={styles.buttonTab}></td>
            )}
          </tr>

          {isLoading ? (
            <tr className={styles.loading}>
              <td className={styles.containerLoading} colSpan={7}>
                <SpinnerPedro />
                Loading...
              </td>
            </tr>
          ) : filteredVaults && filteredVaults.length > 0 ? (
            filteredVaults.map((vault, index) => {
              return (
                <button
                  onClick={(event) => handleRestake(event, vault.address)}
                  className={styles.lineTab}
                  key={index}
                >
                  <td
                    className={styles.nameTab}
                    title={vault.name ? vault.name : "No name vault"}
                    style={{
                      viewTransitionName:
                        "name-strategy-avs-" + vault.address.toLowerCase(),
                    }}
                  >
                    {vault.name ? vault.name : "No name vault"}
                  </td>
                  <td className={styles.totalStakeTab}>
                    <Bitcoin />
                    {/* <Image src={ETH} alt="ETH" width={18} height={18} /> */}
                    <span>{vault.total_stake.toFixed(1)} BTC</span>
                    <span className={styles.valueInUSD}>
                      {formatNumber(vault.total_stake * BTC_PRICE)} $
                    </span>
                  </td>
                  <td className={styles.apyTab}>{vault.apy.toFixed(2)}%</td>
                  <td className={styles.restakingProtocolTab}>
                    <BabylonIcon height={20} width={20} title="Babylon" />
                    Babylon
                  </td>
                  <td className={styles.avsTab}>
                    <ListPoSChain avsList={vault.pos_chains} />
                  </td>
                  <td className={styles.commissionTab}>
                    {vault.avg_commission.toFixed(2)}%
                  </td>
                  {button !== false && (
                    <td className={styles.buttonTab}>
                      <button
                        onClick={
                          button?.onClick
                            ? button.onClick
                            : (event) => handleRestake(event, vault.address)
                        }
                      >
                        {button?.text || "Restake"}
                      </button>
                    </td>
                  )}
                </button>
              );
            })
          ) : (
            <tr className={styles.noResult}>
              <td className={styles.containerNoResult} colSpan={7}>
                <Lottie
                  animationData={EmptyLottie}
                  loop
                  autoplay
                  style={{ width: "100px", height: "100px" }}
                />
                Oops! No AVS found.
                <br />
                Try broader terms.
              </td>
            </tr>
          )}
        </table>
      </div>
    </div>
  );
};

export default ContentVaults;
