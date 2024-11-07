// src/components/ContentVaults/SearchBar/SearchBar.tsx

import ByzantineLogo from "@/assets/byzantine/byzantineHeadLogo.png";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import styles from "./SearchBar.module.scss";
import SearchIcon from "@/assets/icons/search.svg";
import { PoSChain } from "@/app/types/vaultsData";

interface SearchBarProps {
  listPoSChains: PoSChain[];
  setFilteredListPoSChains: (listPoSChains: PoSChain[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  listPoSChains,
  setFilteredListPoSChains,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Ajout d'un état local pour la valeur de recherche
  const [searchValue, setSearchValue] = React.useState("");

  // Modification de la fonction filterListAVS
  function filterListPoSChains(value: string) {
    setSearchValue(value);
    const lowercaseValue = value.toLowerCase();

    const startsWithResults = listPoSChains.filter(
      (posChain) =>
        posChain.name.toLowerCase().startsWith(lowercaseValue) ||
        posChain?.description?.toLowerCase().startsWith(lowercaseValue) ||
        posChain.address.toLowerCase().startsWith(lowercaseValue) ||
        posChain.protocol?.toLowerCase().startsWith(lowercaseValue)
    );

    const withoutStartsWith = listPoSChains.filter(
      (posChain) => !startsWithResults.includes(posChain)
    );

    const includesResults = withoutStartsWith.filter(
      (posChain) =>
        (posChain.name.toLowerCase().includes(lowercaseValue) &&
          !posChain.name.toLowerCase().startsWith(lowercaseValue)) ||
        (posChain?.description?.toLowerCase().includes(lowercaseValue) &&
          !posChain?.description?.toLowerCase().startsWith(lowercaseValue)) ||
        (posChain.address.toLowerCase().includes(lowercaseValue) &&
          !posChain.address.toLowerCase().startsWith(lowercaseValue)) ||
        (posChain.protocol?.toLowerCase().includes(lowercaseValue) &&
          !posChain.protocol?.toLowerCase().startsWith(lowercaseValue))
    );

    const filteredListPoSChains = [...startsWithResults, ...includesResults];
    setFilteredListPoSChains(filteredListPoSChains);
  }

  useEffect(() => {
    filterListPoSChains(searchValue);
  }, [searchValue]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Vérifier si l'élément actif est un input ou textarea
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";

      if (
        (event.key === "f" || event.key === "F") &&
        !event.metaKey &&
        !isInputActive
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Render
  return (
    <div className={styles.searchBar}>
      <SearchIcon className={styles.searchIcon} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search PoS Chains"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
