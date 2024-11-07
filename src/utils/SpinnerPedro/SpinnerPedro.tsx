import Image from "next/image";

import styles from "./SpinnerPedro.module.scss";
import ByzantineHeadLogo from "@/assets/byzantine/byzantineHeadLogo.png";
import HorseHand from "@/assets/horseHand.png";

interface SpinnerPedroProps {
  size?: number;
  isFlash?: boolean;
}

export const SpinnerPedro: React.FC<SpinnerPedroProps> = ({
  size = 1,
  isFlash = true,
}) => {
  const spinnerStyle = {
    transform: `scale(${size})`,
    transformOrigin: "center",
  };
  // Render
  return (
    <div className={styles.spinner} style={spinnerStyle}>
      <div className={styles.containerByz}>
        <Image
          src={ByzantineHeadLogo}
          alt="Byzantine Head Logo"
          className={styles.head}
        />
        <div className={styles.hand} />
        <Image
          src={HorseHand}
          alt="Byzantine Head Logo"
          className={styles.hand}
        />
      </div>
      {isFlash && <div className={styles.flash} />}
    </div>
  );
};
