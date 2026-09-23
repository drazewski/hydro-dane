import type { Metadata } from 'next';
import { Text, Title } from '@mantine/core';
import Header from '../components/header/Header';
import { Footer } from '../components/footer/Footer';
import StationMap from './StationMap';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mapa stacji hydrologicznych',
  description:
    'Mapa Polski z lokalizacjami stacji hydrologicznych oraz nazwami rzek i stacji pomiarowych.',
  alternates: {
    canonical: 'https://hydro-dane.vercel.app/mapa',
  },
};

export default function MapPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <header className={styles.intro}>
          <Title order={2} fw={400}>Mapa stacji hydrologicznych</Title>
          <Text c="dimmed">
            Najedź na punkt, aby zobaczyć szczegóły. Kliknięcie wybierze stację i otworzy jej wykresy.
          </Text>
        </header>
        <section className={styles.mapCard} aria-label="Mapa stacji">
          <StationMap />
        </section>
      </main>
      <Footer />
    </>
  );
}
