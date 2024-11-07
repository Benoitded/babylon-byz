// src/components/ContentVaults/SearchBar/SearchBar.tsx

import ByzantineLogo from "@/assets/byzantine/byzantineHeadLogo.png";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import styles from "./SearchBar.module.scss";
import SearchIcon from "@/assets/icons/search.svg";
import { PoSChain } from "@/app/types/vaultsData";

interface SearchBarProps {
  listAVSs: PoSChain[];
  setFilteredListAVSs: (listAVSs: PoSChain[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  listAVSs,
  setFilteredListAVSs,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Ajout d'un état local pour la valeur de recherche
  const [searchValue, setSearchValue] = React.useState("");

  // Modification de la fonction filterListAVS
  function filterListAVS(value: string) {
    setSearchValue(value);
    const lowercaseValue = value.toLowerCase();

    const startsWithResults = listAVSs.filter(
      (vault) =>
        vault.name.toLowerCase().startsWith(lowercaseValue) ||
        vault?.description?.toLowerCase().startsWith(lowercaseValue) ||
        vault.address.toLowerCase().startsWith(lowercaseValue)
    );

    const withoutStartsWith = listAVSs.filter(
      (vault) => !startsWithResults.includes(vault)
    );

    const includesResults = withoutStartsWith.filter(
      (vault) =>
        (vault.name.toLowerCase().includes(lowercaseValue) &&
          !vault.name.toLowerCase().startsWith(lowercaseValue)) ||
        (vault?.description?.toLowerCase().includes(lowercaseValue) &&
          !vault?.description?.toLowerCase().startsWith(lowercaseValue)) ||
        (vault.address.toLowerCase().includes(lowercaseValue) &&
          !vault.address.toLowerCase().startsWith(lowercaseValue))
    );

    const filteredListAVSs = [...startsWithResults, ...includesResults];
    setFilteredListAVSs(filteredListAVSs);
  }

  useEffect(() => {
    filterListAVS(searchValue);
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
        placeholder="Search AVS"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
