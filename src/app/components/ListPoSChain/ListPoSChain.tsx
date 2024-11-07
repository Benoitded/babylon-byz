import React, { useState, useEffect } from "react";
import styles from "./ListPoSChain.module.scss";
import { Tooltip } from "@nextui-org/react";
import Blockies from "react-blockies";

import { PoSChain } from "@/app/types/vaultsData";
import { useDataAVS } from "@/app/context/ContextProvider";

import { Link, useTransitionRouter } from "next-view-transitions";

function removeTextInParentheses(text: string): string {
  return text.replace(/\s*\(.*?\)\s*/g, "").trim();
}

interface ListPoSChainProps {
  avsList?: PoSChain[]; // Use this if you already have AVS data
  avsContracts?: string[]; // Use this if you only have contract addresses and need to fetch AVS data
  numberOfAVStoDisplay?: number;
  isLinkAVS?: boolean; // Controls whether the AVS items are clickable links
}

const ListPoSChain: React.FC<ListPoSChainProps> = ({
  avsList,
  avsContracts,
  numberOfAVStoDisplay = 4,
  isLinkAVS = true, // Default is true
}) => {
  const [displayedAVS, setDisplayedAVS] = useState<PoSChain[] | undefined>();
  const { dataPosChain } = useDataAVS(); // Removed getDataAVS
  const router = useTransitionRouter();
  const [hoveredAVS, setHoveredAVS] = useState<string | null>(null);

  useEffect(() => {
    if (avsList) {
      setDisplayedAVS(avsList);
    } else if (avsContracts) {
      const avsDetails: PoSChain[] = avsContracts.map((contract) => {
        const avsData = dataPosChain.find((avs) => avs.address === contract);
        if (!avsData) {
          console.log("contract", contract, dataPosChain);
          throw new Error(`AVS contract ${contract} not found in API data`);
        }
        return {
          ...avsData,
        };
      });
      setDisplayedAVS(avsDetails);
    }
  }, [avsList, avsContracts, dataPosChain]);

  if (!displayedAVS) return null;

  return (
    <div className={styles.listPoSChain}>
      {displayedAVS
        .slice(
          0,
          displayedAVS.length > numberOfAVStoDisplay + 1
            ? numberOfAVStoDisplay
            : numberOfAVStoDisplay + 1
        )
        .map((avs, index) => {
          const content = (
            <div
              className={styles.divAVS}
              onMouseEnter={() => setHoveredAVS(avs.address)}
              onMouseLeave={() => setHoveredAVS(null)}
            >
              <div
                className={styles.divImg}
                style={{
                  viewTransitionName:
                    hoveredAVS === avs.address
                      ? "avs-image-" + avs.address
                      : "",
                }}
              >
                {avs.image_url ? (
                  <img src={avs.image_url} alt={avs.name} />
                ) : (
                  <Blockies
                    seed={avs.address.toLowerCase()}
                    size={8}
                    scale={4}
                  />
                )}
              </div>
              <span>{avs.name}</span>
            </div>
          );

          const clickableContent = isLinkAVS ? (
            <Link
              href={`/avs/${avs.address}`} // Modifié pour pointer vers la page AVS
            >
              {content}
            </Link>
          ) : (
            content
          );

          return <div key={index}>{clickableContent}</div>;
        })}
      {displayedAVS.length > numberOfAVStoDisplay + 1 && (
        <Tooltip
          delay={500}
          // closeDelay={9000000}
          content={
            <div className="tooltip">
              {displayedAVS
                .slice(-(displayedAVS.length - numberOfAVStoDisplay))
                .map((avs) => (
                  <div key={avs.address} className={styles.tooltipLine}>
                    <div
                      className={styles.divImg}
                      style={{
                        viewTransitionName: "avs-image-" + avs.address,
                      }}
                    >
                      {avs.image_url ? (
                        <img src={avs.image_url} alt={avs.name} />
                      ) : (
                        <Blockies
                          seed={avs.address.toLowerCase()}
                          size={8}
                          scale={4}
                        />
                      )}
                    </div>
                    {isLinkAVS ? (
                      <Link href={`/avs/${avs.address}`}>
                        <span>{removeTextInParentheses(avs.name)}</span>
                      </Link>
                    ) : (
                      <span>{removeTextInParentheses(avs.name)}</span>
                    )}
                  </div>
                ))}
            </div>
          }
        >
          <div className={`${styles.divImg} ${styles.extraNum}`}>
            +{displayedAVS.length - numberOfAVStoDisplay}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default ListPoSChain;
