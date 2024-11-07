// src/components/ContentAVSsBasket.tsx
import React, { useEffect, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
// import { Link } from "next-view-transitions";
import Lottie from "lottie-react";

import EmptyLottie from "@/assets/lottie/empty.json";
import FullBabylonLogo from "@/assets/FullBabylonLogo.svg";
import FullSymbioticLogo from "@/assets/FullSymbioticLogo.svg";

import ArrowsOrderIcon from "@/assets/icons/arrowsOrder.svg";
import styles from "./ContentAVSsBasket.module.scss";
import { useDataAVS } from "@/app/context/ContextProvider";

import SearchBar from "./SearchBar/SearchBar";
import { PoSChain } from "@/app/types/vaultsData";
import AddToBasket from "@/app/components/AddToBasket/AddToBasket";
import toast from "react-hot-toast";
import { SpinnerPedro } from "@/utils/SpinnerPedro/SpinnerPedro";
import Blockies from "react-blockies";
import { ProtocolType } from "@/app/types/vaultsData";

interface ContentAVSsBasketProps {
  isSearchBar?: boolean;
  isLoading?: boolean;
  protocol: ProtocolType;
}

type Order = "random" | "name" | "apy" | "commission" | "protocol";
type SortDirection = "asc" | "desc";

const ContentAVSsBasket: React.FC<ContentAVSsBasketProps> = ({
  isSearchBar,
  isLoading,
  protocol,
}) => {
  const router = useTransitionRouter();
  const { dataPosChain, dataSymbioticAVS } = useDataAVS();
  const [sortedAVSs, setSortedAVSs] = useState<PoSChain[]>([]);
  const [filteredAVSs, setFilteredAVSs] = useState<PoSChain[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order>("random");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Effet pour initialiser et trier les vaults
  useEffect(() => {
    const currentData =
      protocol === "Babylon" ? dataPosChain : dataSymbioticAVS;
    if (currentData) {
      const initialSortedVaults = [...currentData];
      sortAVSs(initialSortedVaults, currentOrder, sortDirection);
      setSortedAVSs(initialSortedVaults);
    }
  }, [dataPosChain, dataSymbioticAVS, protocol, currentOrder, sortDirection]);

  // Effet pour filtrer les vaults triés
  useEffect(() => {
    const filtered = sortedAVSs.filter((avs) =>
      avs.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAVSs(filtered);
  }, [sortedAVSs, searchTerm]);

  function sortAVSs(AVSs: PoSChain[], order: Order, direction: SortDirection) {
    const sortFunctions = {
      random: () => Math.random() - 0.5,
      name: (a: PoSChain, b: PoSChain) =>
        (a.name || "").localeCompare(b.name || ""),
      // total_staked: (a: PoSChain, b: PoSChain) =>
      //   b.total_staked - a.total_staked,
      apy: (a: PoSChain, b: PoSChain) => b.apy - a.apy,
      commission: (a: PoSChain, b: PoSChain) => b.commission - a.commission,
      protocol: (a: PoSChain, b: PoSChain) =>
        (a.protocol || "").localeCompare(b.protocol || ""),
    };

    const sortFunction = sortFunctions[order];
    AVSs.sort((a, b) => {
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

    const newSortedAVSs = [...sortedAVSs];
    sortAVSs(newSortedAVSs, order, sortDirection);
    setSortedAVSs(newSortedAVSs);
  }

  return (
    <div className={styles.contentAVSsBasket}>
      <div className={styles.firstLine}>
        <div className={styles.leftFirstLine}>
          <div
            className={`${styles.protocolIcon} ${
              protocol === "Babylon" ? styles.selected : ""
            }`}
          >
            <FullBabylonLogo width="auto" height={20} />
          </div>
          <div
            className={`${styles.protocolIcon} ${
              protocol === "Symbiotic" ? styles.selected : ""
            }`}
          >
            <FullSymbioticLogo width="auto" height={24} />
          </div>
        </div>
        <div className={styles.rightFirstLine}>
          {isSearchBar && (
            <SearchBar
              listAVSs={sortedAVSs || []}
              setFilteredListAVSs={setFilteredAVSs}
            />
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table>
          <tr className={`${styles.lineTab} ${styles.header}`}>
            <td
              onClick={() => handleOrderChange("name")}
              className={`${styles.nameTab} ${styles.clickable} ${
                currentOrder === "name"
                  ? sortDirection === "asc"
                    ? styles.asc
                    : styles.desc
                  : ""
              }`}
            >
              Name
              <ArrowsOrderIcon />
            </td>
            {/* <td className={`${styles.totalStakeTab} ${styles.clickable}`}>
              Total Stake
              <ArrowsOrderIcon
                onClick={() => handleOrderChange("total_staked")}
                className={
                  currentOrder === "total_staked"
                    ? sortDirection === "asc"
                      ? styles.asc
                      : styles.desc
                    : ""
                }
              />
            </td> */}
            <td
              onClick={() => handleOrderChange("apy")}
              className={`${styles.apyTab} ${styles.clickable} ${
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
            <td
              onClick={() => handleOrderChange("commission")}
              className={`${styles.commissionTab} ${styles.clickable} ${
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
            <td className={styles.buttonTab}></td>
          </tr>

          {isLoading ? (
            <tr className={styles.loading}>
              <td className={styles.containerLoading} colSpan={7}>
                <SpinnerPedro />
                Loading...
              </td>
            </tr>
          ) : filteredAVSs && filteredAVSs.length > 0 ? (
            filteredAVSs.map((AVS, index) => {
              return (
                <div className={styles.lineTab} key={index}>
                  <td
                    className={styles.nameTab}
                    title={AVS.name ? AVS.name : "No name vault"}
                    style={{
                      viewTransitionName:
                        "name-strategy-avs-" + AVS.address.toLowerCase(),
                    }}
                  >
                    <div className={styles.divImg}>
                      {AVS.image_url ? (
                        <img src={AVS.image_url} alt={AVS.name} />
                      ) : (
                        <Blockies seed={AVS.address} size={10} />
                      )}
                    </div>
                    {AVS.name ? AVS.name : "No name AVS"}
                  </td>
                  {/* <td className={styles.totalStakeTab}>
                    <Image src={ETH} alt="ETH" width={18} height={18} />
                    <span>{AVS.total_staked.toFixed(1)} ETH</span>
                    <span className={styles.valueInUSD}>
                      {formatNumber(AVS.total_staked * ETH_PRICE)} $
                    </span>
                  </td> */}
                  <td className={styles.apyTab}>{AVS.apy.toFixed(2)}%</td>
                  <td className={styles.commissionTab}>
                    {AVS.commission.toFixed(2)}%
                  </td>
                  <td className={styles.buttonTab}>
                    {/* <button
                      onClick={(event) => handleRestake(event, AVS.address)}
                    >
                      Add to basket
                    </button> */}
                    <AddToBasket avs={AVS} isSmall />
                  </td>
                </div>
              );
            })
          ) : (
            <tr className={styles.noResult}>
              <td className={styles.containerNoResult}>
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

export default ContentAVSsBasket;
