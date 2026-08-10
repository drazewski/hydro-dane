import type { Metadata } from 'next';
import Link from 'next/link';
import { Anchor, List, ListItem, Stack, Text, Title } from '@mantine/core';
import Header from '../components/header/Header';
import { Footer } from '../components/footer/Footer';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Przewodnik korzystania z aplikacji',
  description:
    'Przewodnik po wykresach danych hydrologicznych HydroDane: wybór stacji, dane roczne i miesięczne, trend, kalendarz danych oraz charakterystyki hydrologiczne.',
  alternates: {
    canonical: 'https://hydro-dane.vercel.app/przewodnik',
  },
};

const GuidePage = () => (
  <>
    <Header />
    <main className={styles.main}>
      <article className={styles.article}>
        <Stack gap="xl">
          <header>
            <Title order={2} fw={400}>Jak korzystać z HydroDane</Title>
            <Text mt="sm" c="dimmed">
              HydroDane pozwala przeglądać archiwalne dane hydrologiczne ze stacji pomiarowych w Polsce: stany wody, przepływy i temperaturę wody.
            </Text>
          </header>

          <section>
            <Title order={3}>1. Wybierz stację</Title>
            <Text mt="xs">
              W polu „Stacja pomiarowa” wyszukasz lokalizację po nazwie rzeki, miejscowości lub identyfikatorze stacji. Pole pozostaje dostępne po wyborze, więc w każdej chwili możesz przejść do innej stacji.
            </Text>
          </section>

          <section>
            <Title order={3}>2. Ustaw rodzaj danych i zakres lat</Title>
            <Text mt="xs">
              Wybierz stan wody, przepływ albo temperaturę wody, a następnie okres danych. Zakresy dostępne w filtrach zależą od danych zachowanych dla konkretnej stacji.
            </Text>
          </section>

          <section>
            <Title order={3}>3. Dane roczne i miesięczne</Title>
            <Text mt="xs">
              Widok roczny ułatwia porównanie kolejnych lat hydrologicznych. Widok miesięczny pokazuje zmianę danych w czasie z większą szczegółowością; można też porównać jeden wybrany miesiąc we wszystkich dostępnych latach.
            </Text>
          </section>

          <section>
            <Title order={3}>4. Wartości i sposób prezentacji</Title>
            <List mt="xs" spacing="xs">
              <ListItem>wartości minimalne, średnie i maksymalne można prezentować jednocześnie lub osobno;</ListItem>
              <ListItem>linia trendu pokazuje kierunek zmian wybranej serii w czasie;</ListItem>
              <ListItem>kalendarz danych miesięcznych pozwala szybko dostrzec sezonowość i nietypowe okresy.</ListItem>
            </List>
          </section>

          <section>
            <Title order={3}>5. Charakterystyki i ekstrema</Title>
            <Text mt="xs">
              Pod wykresem rocznym znajdziesz zestawienie charakterystyk stanów lub przepływów oraz ekstremów z dostępnego okresu obserwacji. Skróty w tabeli charakterystyk rozwijają się po najechaniu kursorem.
            </Text>
          </section>

          <section>
            <Title order={3}>6. Jak interpretować dane</Title>
            <Text mt="xs">
              Lata w aplikacji są latami hydrologicznymi. Brak wartości nie zawsze oznacza błąd — część serii źródłowych może być niepełna. Roczne wartości są prezentowane tylko dla kompletnych lat hydrologicznych danego pomiaru.
            </Text>
          </section>

          <section>
            <Title order={3}>Źródło i przetworzenie danych</Title>
            <Text mt="xs">
              Źródłem danych jest <Anchor href="https://imgw.pl/" target="_blank">Instytut Meteorologii i Gospodarki Wodnej – Państwowy Instytut Badawczy</Anchor>. Dane zostały przetworzone na potrzeby wizualizacji i są udostępniane w aplikacji w postaci statycznych plików danych.
            </Text>
          </section>

          <Text size="sm" c="dimmed">
            Przykłady ekranów i dodatkowe objaśnienia poszczególnych widoków zostaną dodane w kolejnych wersjach przewodnika.
          </Text>

          <Link href="/" className={styles.backLink}>Wróć do wykresów</Link>
        </Stack>
      </article>
    </main>
    <Footer />
  </>
);

export default GuidePage;
