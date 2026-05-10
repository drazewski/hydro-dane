import type { Metadata } from "next";
import { Stack, Text, Title } from "@mantine/core";
import Header from "../components/header/Header";
import { Footer } from "../components/footer/Footer";
import AnalyticsSettingsButton from "../components/analytics/AnalyticsSettingsButton";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Prywatność",
  alternates: {
    canonical: "https://hydro-dane.vercel.app/prywatnosc",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Stack gap="lg" maw={800}>
          <Title order={2} fw={400}>
            Prywatność
          </Title>

          <Stack gap="xs">
            <Title order={4} fw={500}>
              Anonimowa analityka
            </Title>
            <Text size="sm" c="dimmed">
              Używamy narzędzi analitycznych do anonimowej analityki odwiedzin. Analityka pomaga sprawdzić, które części strony są używane oraz jakie dane są najczęściej sprawdzane. Dane są anonimowe i nie zawierają żadnych informacji, które pozwalałyby na identyfikację użytkowników.
            </Text>
            <Text size="sm" c="dimmed">
              Konfiguracja analityki na tej stronie nie używa plików cookie, a wybór zapisywany jest lokalnie w przeglądarce.
            </Text>
            <Text size="sm" c="dimmed">
              Możesz w każdej chwili zmienić wcześniejszą decyzję.
            </Text>
          </Stack>

          <AnalyticsSettingsButton />
        </Stack>
      </main>
      <Footer />
    </>
  );
}
