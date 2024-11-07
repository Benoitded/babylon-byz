// src/components/ContentPoSChains.tsx
import React, { useEffect, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Link } from "next-view-transitions";
import Lottie from "lottie-react";

import EmptyLottie from "@/assets/lottie/empty.json";
import EigenLayerIcon from "@/assets/brands/eigenlayer.svg";

import ArrowsOrderIcon from "@/assets/icons/arrowsOrder.svg";
import styles from "./ContentPoSChains.module.scss";
import FullBabylonLogo from "@/assets/fullBabylonLogo.svg";

import SearchBar from "./SearchBar/SearchBar";
import { PoSChain } from "@/app/types/vaultsData";
import toast from "react-hot-toast";
import { SpinnerPedro } from "@/utils/SpinnerPedro/SpinnerPedro";
import Blockies from "react-blockies";

interface ContentPoSChainsProps {
  posChainList: PoSChain[];
  isSearchBar?: boolean;
  isLoading?: boolean;
}

type Order = "random" | "name" | "apy" | "commission" | "protocol";
type SortDirection = "asc" | "desc";

const ContentPoSChains: React.FC<ContentPoSChainsProps> = ({
  posChainList,
  isSearchBar,
  isLoading,
}) => {
  const [sortedPoSChains, setSortedPoSChains] = useState<PoSChain[]>([]);
  const [filteredPoSChains, setFilteredPoSChains] =
    useState<PoSChain[]>(posChainList);
  const [currentOrder, setCurrentOrder] = useState<Order>("random");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Effet pour initialiser et trier les vaults
  useEffect(() => {
    if (posChainList) {
      const initialSortedPoSChains = [...posChainList];
      sortPoSChains(initialSortedPoSChains, currentOrder, sortDirection);
      setSortedPoSChains(initialSortedPoSChains);
    }
  }, [posChainList, currentOrder, sortDirection]);

  // Effet pour filtrer les vaults triés
  useEffect(() => {
    const filtered = posChainList.filter((posChain) =>
      posChain.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sortedFiltered = [...filtered];
    sortPoSChains(sortedFiltered, currentOrder, sortDirection);
    setFilteredPoSChains(sortedFiltered);
  }, [posChainList, searchTerm, currentOrder, sortDirection]);

  function sortPoSChains(
    PoSChains: PoSChain[],
    order: Order,
    direction: SortDirection
  ) {
    const sortFunctions = {
      random: () => Math.random() - 0.5,
      name: (a: PoSChain, b: PoSChain) =>
        (a.name || "").localeCompare(b.name || ""),
      apy: (a: PoSChain, b: PoSChain) => b.apy - a.apy,
      commission: (a: PoSChain, b: PoSChain) => b.commission - a.commission,
      //pour ptotocol par ordre alphabétique
      protocol: (a: PoSChain, b: PoSChain) =>
        (a.protocol || "").localeCompare(b.protocol || ""),
    };

    const sortFunction = sortFunctions[order];
    PoSChains.sort((a, b) => {
      const result = sortFunction(a, b);
      return direction === "asc" ? result : -result;
    });
  }

  function handleOrderChange(order: Order) {
    const newDirection =
      order === currentOrder && sortDirection === "asc" ? "desc" : "asc";
    setCurrentOrder(order);
    setSortDirection(newDirection);

    const newSortedPoSChains = [...posChainList];
    sortPoSChains(newSortedPoSChains, order, newDirection);
    setSortedPoSChains(newSortedPoSChains);
  }

  return (
    <div className={styles.contentPoSChains}>
      <div className={styles.firstLine}>
        <div className={styles.title}>Consumer Chains</div>
        <div className={styles.rightFirstLine}>
          {isSearchBar && (
            <SearchBar
              listPoSChains={sortedPoSChains || []}
              setFilteredListPoSChains={setFilteredPoSChains}
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
            <td
              onClick={() => handleOrderChange("protocol")}
              className={`${styles.protocolTab} ${styles.clickable} ${
                currentOrder === "protocol"
                  ? sortDirection === "asc"
                    ? styles.asc
                    : styles.desc
                  : ""
              }`}
            >
              Protocol
              <ArrowsOrderIcon />
            </td>

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
          </tr>

          {isLoading ? (
            <tr className={styles.loading}>
              <td className={styles.containerLoading} colSpan={7}>
                <SpinnerPedro />
                Loading...
              </td>
            </tr>
          ) : filteredPoSChains && filteredPoSChains.length > 0 ? (
            filteredPoSChains.map((PoSChain, index) => {
              return (
                <Link
                  href={`/avs/${PoSChain.address}`}
                  className={styles.lineTab}
                  key={index}
                >
                  <td
                    className={styles.nameTab}
                    title={PoSChain.name ? PoSChain.name : "No name PoS Chain"}
                  >
                    <div
                      className={styles.divImg}
                      style={{
                        viewTransitionName:
                          "avs-image-" + PoSChain.address.toLowerCase(),
                      }}
                    >
                      {/* img or blockies */}
                      {PoSChain.image_url ? (
                        <img src={PoSChain.image_url} alt={PoSChain.name} />
                      ) : (
                        <Blockies seed={PoSChain.address} />
                      )}
                    </div>
                    {PoSChain.name ? PoSChain.name : "No name PoS Chain"}
                  </td>
                  {/* <td className={styles.totalStakeTab}>
                    <Image src={ETH} alt="ETH" width={18} height={18} />
                    <span>{AVS.total_staked.toFixed(1)} ETH</span>
                    <span className={styles.valueInUSD}>
                      {formatNumber(AVS.total_staked * ETH_PRICE)} $
                    </span>
                  </td> */}
                  <td className={styles.protocolTab}>
                    <FullBabylonLogo />
                    {/* {PoSChain.protocol === "Babylon" ? (
                      <FullBabylonLogo />
                    ) : (
                      "Symbiotic"
                    )} */}
                  </td>
                  <td className={styles.apyTab}>{PoSChain.apy.toFixed(2)}%</td>
                  <td className={styles.commissionTab}>
                    {PoSChain.commission.toFixed(2)}%
                  </td>
                </Link>
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

export default ContentPoSChains;
