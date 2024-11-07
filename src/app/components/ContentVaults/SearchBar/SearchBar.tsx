// src/components/ContentVaults/SearchBar/SearchBar.tsx

import ByzantineLogo from "@/assets/byzantine/byzantineHeadLogo.png";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import styles from "./SearchBar.module.scss";
import SearchIcon from "@/assets/icons/search.svg";
import { VaultToDisplay } from "@/app/types/vaultsData";

interface SearchBarProps {
  listVaults: VaultToDisplay[];
  setFilteredListVaults: (listVaults: VaultToDisplay[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  listVaults,
  setFilteredListVaults,
}) => {
  // console.log("In search bar contentvault", listVaults);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Ajout d'un état local pour la valeur de recherche
  const [searchValue, setSearchValue] = React.useState("");

  // Modification de la fonction filterListVaults
  function filterListVaults(value: string) {
    setSearchValue(value);
    const lowercaseValue = value.toLowerCase();

    const startsWithResults = listVaults.filter(
      (vault) =>
        vault.name.toLowerCase().startsWith(lowercaseValue) ||
        vault?.description?.toLowerCase().startsWith(lowercaseValue) ||
        vault.address.toLowerCase().startsWith(lowercaseValue) ||
        vault.pos_chains.some(
          (chain) =>
            chain.address.toLowerCase().startsWith(lowercaseValue) ||
            chain.name.toLowerCase().startsWith(lowercaseValue) ||
            chain.description?.toLowerCase().startsWith(lowercaseValue)
        ) ||
        vault.avs_symbiotic.some(
          (avs) =>
            avs.address.toLowerCase().startsWith(lowercaseValue) ||
            avs.name.toLowerCase().startsWith(lowercaseValue) ||
            avs.description?.toLowerCase().startsWith(lowercaseValue)
        )
    );

    // get the list without startsWith
    const listWithoutStartsWith = listVaults.filter(
      (vault) => !startsWithResults.includes(vault)
    );

    const includesResults = listWithoutStartsWith.filter(
      (vault) =>
        (vault.name.toLowerCase().includes(lowercaseValue) &&
          !vault.name.toLowerCase().startsWith(lowercaseValue)) ||
        (vault?.description?.toLowerCase().includes(lowercaseValue) &&
          !vault?.description?.toLowerCase().startsWith(lowercaseValue)) ||
        (vault.address.toLowerCase().includes(lowercaseValue) &&
          !vault.address.toLowerCase().startsWith(lowercaseValue)) ||
        vault.pos_chains.some(
          (chain) =>
            (chain.address.toLowerCase().includes(lowercaseValue) &&
              !chain.address.toLowerCase().startsWith(lowercaseValue)) ||
            (chain.name.toLowerCase().includes(lowercaseValue) &&
              !chain.name.toLowerCase().startsWith(lowercaseValue)) ||
            (chain.description?.toLowerCase().includes(lowercaseValue) &&
              !chain.description?.toLowerCase().startsWith(lowercaseValue))
        ) ||
        vault.avs_symbiotic.some(
          (avs) =>
            (avs.address.toLowerCase().includes(lowercaseValue) &&
              !avs.address.toLowerCase().startsWith(lowercaseValue)) ||
            (avs.name.toLowerCase().includes(lowercaseValue) &&
              !avs.name.toLowerCase().startsWith(lowercaseValue))
        )
    );

    console.log("startsWithResults", startsWithResults);
    const filteredListVaults = [...startsWithResults, ...includesResults];
    setFilteredListVaults(filteredListVaults);
  }

  useEffect(() => {
    filterListVaults(searchValue);
  }, [searchValue]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "f" || event.key === "F") && !event.metaKey) {
        if (!inputRef.current?.matches(":focus")) {
          event.preventDefault();
          inputRef.current?.focus();
        }
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
        placeholder="Search vaults"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
