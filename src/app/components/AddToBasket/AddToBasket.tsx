import React, { useEffect, useState } from "react";
import styles from "./AddToBasket.module.scss";
import { useLocalStorage } from "@/app/context/ContextProvider";

import StackPlus from "@/assets/stack/plus.svg";
import StackMinus from "@/assets/stack/minus.svg";
import StackBasket from "@/assets/stack/basket.svg";
import { PoSChain } from "@/app/types/vaultsData";
import toast from "react-hot-toast";

interface AddToBasketProps {
  avs: PoSChain;
  isSmall?: boolean;
}

const cleanName = (name: string): string => {
  return name.replace(/\(.*?\)/g, "").trim();
};

const AddToBasket: React.FC<AddToBasketProps> = ({ avs, isSmall = false }) => {
  const { avsInBasket, addToLocal, removeFromLocal } = useLocalStorage();
  const [isHover, setIsHover] = useState<boolean>(false);
  const [isInTheBasket, setIsInTheBasket] = useState<boolean>(false);

  const cleanedName = cleanName(avs.name);

  useEffect(() => {
    setIsInTheBasket(avsInBasket.includes(avs.address));
  }, [avsInBasket, avs.address]);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isInTheBasket) {
      removeFromLocal("avsInBasket", avs.address);
      toast(`${cleanedName} removed from AVS strategy`, {
        icon: "🗑️",
      });
    } else {
      addToLocal("avsInBasket", avs.address);
      toast.success(`${cleanedName} added to AVS strategy`);
    }

    setIsInTheBasket(!isInTheBasket);
  };

  return (
    <button
      className={`${styles.addToBasket} ${
        isInTheBasket ? styles.inBasket : ""
      } ${isSmall ? styles.small : ""}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={handleClick}
    >
      {!isInTheBasket ? "Add to basket" : !isHover ? "In basket" : "Remove"}
    </button>
  );
};

export default AddToBasket;
