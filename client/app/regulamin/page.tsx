import type { Metadata } from "next";
import { Text, Title, Stack } from "@mantine/core";
import Header from "../components/header/Header";
import { Footer } from "../components/footer/Footer";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Regulamin strony",
  alternates: {
    canonical: "https://hydro-dane.vercel.app/regulamin",
  },
};

export default function RegulaminPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Stack gap="lg" maw={800}>
          <Title order={2} fw={400}>Regulamin strony</Title>

          <Stack gap="xs">
            <Title order={4} fw={500}>1. Postanowienia ogólne</Title>
            <Text size="sm" c="dimmed">
              Serwis HydroDane udostępnia wizualizacje archiwalnych danych hydrologicznych pochodzących z zasobów publicznych
              Instytutu Meteorologii i Gospodarki Wodnej – Państwowego Instytutu Badawczego (IMGW-PIB).
              Serwis nie jest powiązany, afiliowany ani sponsorowany przez IMGW-PIB.
            </Text>
          </Stack>

          <Stack gap="xs">
            <Title order={4} fw={500}>2. Źródło danych</Title>
            <Text size="sm" c="dimmed">
              Dane prezentowane w serwisie pochodzą z publicznych zasobów udostępnianych przez IMGW-PIB
              pod adresem danepubliczne.imgw.pl. Właścicielem danych jest Skarb Państwa, a rozporządza nimi IMGW-PIB. Dane zostały przetworzone na potrzeby wizualizacji.
              Wszelkie prawa do wizualizacji i wykresów zastrzeżone – HydroDane.
            </Text>
          </Stack>

          <Stack gap="xs">
            <Title order={4} fw={500}>3. Wyłączenie odpowiedzialności</Title>
            <Text size="sm" c="dimmed">
              IMGW-PIB nie ponosi odpowiedzialności za jakiekolwiek szkody wynikające z udostępnienia,
              korzystania lub przetworzenia danych. Korzystanie z danych odbywa się na wyłączne ryzyko
              użytkownika. Część danych może być niezweryfikowana. Dane nie powinny być wykorzystywane
              do decyzji krytycznych (np. bezpieczeństwo, żegluga, ochrona przeciwpowodziowa).
            </Text>
            <Text size="sm" c="dimmed">
              Właściciel serwisu HydroDane nie ponosi odpowiedzialności za ewentualne błędy, braki
              lub nieaktualność prezentowanych danych.
            </Text>
          </Stack>

          <Stack gap="xs">
            <Title order={4} fw={500}>4. Korzystanie z serwisu</Title>
            <Text size="sm" c="dimmed">
              Serwis jest udostępniany bezpłatnie wyłącznie w celach informacyjnych i edukacyjnych.
              Zabrania się wykorzystywania danych oraz wizualizacji do celów komercyjnych bez zgody autora. 
            </Text>
          </Stack>

          <Stack gap="xs">
            <Title order={4} fw={500}>5. Kontakt</Title>
            <Text size="sm" c="dimmed">
              Wszelkie uwagi, błędy oraz pytania prosimy zgłaszać przez zakładkę{" "}
              <a href="https://github.com/drazewski/hydro-data-charts/issues" target="_blank" rel="noopener noreferrer">
                Zgłoś błąd
              </a>.
            </Text>
          </Stack>
        </Stack>
      </main>
      <Footer />
    </>
  );
}
