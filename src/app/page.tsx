import Image from "next/image";
import styles from "./page.module.scss";
import { Link } from "next-view-transitions";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Your project start here!</h1>
      Don't forget to:
      <ul>
        <li>
          Add the metadata with name, description, keywords, etc. in .layout.tsx
        </li>
        <li>Add the metadata with name, description, url in the reown.tsx</li>
        <li>Change the logo for the header in the assets/ folder</li>
        <li> Change the logo for the icon in the public/ folder</li>
        <li>Define your colors in the globals.css file</li>
        <li>Add the pages in the app/ folder</li>
        <li>Add the components in the components/ folder</li>
        <li>Add the API routes in the src/api/ folder</li>
        <Link href="/second" className={styles.link}>
          Go to second page
        </Link>
      </ul>
    </div>
  );
}
