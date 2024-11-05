import Image from "next/image";
import styles from "./page.module.scss";
import { Link } from "next-view-transitions";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>2nd page</h1>
      <Link href="/" className={styles.link}>
        Go to the first page
      </Link>
    </div>
  );
}
