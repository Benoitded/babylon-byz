import { useAccount } from "wagmi";
import styles from "./AddressLink.module.scss";
import OpenIcon from "@/assets/icons/open.svg";
import { Tooltip } from "@nextui-org/react";

export const AddressLink: React.FC<{
  address: string;
  isShort?: boolean;
  isDisplayIcone?: boolean;
  showYourAddress?: boolean;
  numberDigits?: number;
  isDisplayTooltipMine?: boolean;
  forcedUrl?: string;
}> = ({
  address,
  isShort = false,
  isDisplayIcone = true,
  showYourAddress = true,
  numberDigits = 4,
  isDisplayTooltipMine = true,
  forcedUrl = undefined,
}) => {
  const { isConnected, address: yourAddy } = useAccount();
  const isMine =
    showYourAddress &&
    isConnected &&
    address?.toLowerCase() === yourAddy?.toLowerCase();

  const displayAddress = isShort
    ? `${address?.substring(0, numberDigits + 2)}...${address?.slice(
        -numberDigits
      )}`
    : address;

  const link = (
    <a
      href={forcedUrl || `https://holesky.etherscan.io/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {displayAddress}
      {isDisplayIcone && <OpenIcon />}
    </a>
  );

  return (
    <div
      className={`${styles.addressLink} ${isMine ? styles.mine : ""}`}
      title={isMine ? "Your address" : ""}
    >
      {isMine && isDisplayTooltipMine ? (
        <Tooltip
          offset={5}
          content={<div className="tooltip">Your address</div>}
        >
          {link}
        </Tooltip>
      ) : (
        link
      )}
    </div>
  );
};
