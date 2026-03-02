import styles from "./header.module.css";
import Image from "next/image";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Image src="/icon.svg" alt="" width={30} height={30} className={styles.titleIcon} aria-hidden="true" />
        <h1 className={styles.title}>HydroDane</h1>
      </div>
      <h4 className={styles.subtitle}>Wykresy archiwalnych danych hydrologicznych</h4>
    </header>
  );
};

export default Header;
