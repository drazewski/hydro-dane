'use client';
import styles from "./header.module.css";
import Link from "next/link";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";

const Header = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
      <header className={styles.header}>
        <div className={styles.topRow}>
          <Link href="/" className={styles.brand}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" strokeWidth="0" aria-hidden="true">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path stroke="#fa5252" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7q 4.5 -3 9 0t 9 0"/>
              <path stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 17q 4.5 -3 9 0q .218 .144 .434 .275"/>
              <path stroke="#228be6" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12q 4.5 -3 9 0q 1.941 1.294 3.882 1.472"/>
              <path stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 22v-6"/>
              <path stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 19l-3 -3l-3 3"/>
            </svg>
            <h1 className={styles.title}>HydroDane</h1>
          </Link>
        <ActionIcon variant="subtle" color="gray" onClick={toggleColorScheme} aria-label="Zmień motyw">
          {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>
      </div>
      <h4 className={styles.subtitle}>Wykresy archiwalnych danych hydrologicznych</h4>
    </header>
  );
};

export default Header;
