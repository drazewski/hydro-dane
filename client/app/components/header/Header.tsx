import styles from "./header.module.css";
import { IconRippleUp } from "@tabler/icons-react";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <IconRippleUp size={30} strokeWidth={1.5} className={styles.titleIcon} />
        <h1 className={styles.title}>HydroDane</h1>
      </div>
      <h4 className={styles.subtitle}>Wykresy archiwalnych danych hydrologicznych</h4>
    </header>
  );
};

export default Header;
