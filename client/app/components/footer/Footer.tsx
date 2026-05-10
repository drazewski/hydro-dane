import { Group, Anchor, Text, Stack } from "@mantine/core";
import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--mantine-color-gray-2)",
        marginTop: "40px",
      }}
    >
      <div style={{ padding: "var(--mantine-spacing-md) 10px" }}>
        <Stack gap="xs">
          <Group gap="xl" wrap="wrap" className={styles.links}>
            <Anchor
              href="https://github.com/drazewski/hydro-data-charts"
              target="_blank"
              size="sm"
              c="dimmed"
            >
              Repozytorium GitHub
            </Anchor>
            <Anchor
              href="https://github.com/drazewski/hydro-data-charts/issues"
              target="_blank"
              size="sm"
              c="dimmed"
            >
              Zgłoś błąd
            </Anchor>
            <Anchor
              href="https://danepubliczne.imgw.pl/"
              target="_blank"
              size="sm"
              c="dimmed"
            >
              Dane publiczne IMGW
            </Anchor>
            <Anchor href="/regulamin" size="sm" c="dimmed">
              Regulamin strony
            </Anchor>
            <Anchor href="/prywatnosc" size="sm" c="dimmed">
              Prywatność
            </Anchor>
          </Group>
          <Text size="xs" c="dimmed">
            HydroDane – wszystkie prawa do wizualizacji i wykresów zastrzeżone. Dane źródłowe: IMGW-PIB.
          </Text>
          <Text size="xs" c="dimmed">
            Serwis nie jest powiązany, afiliowany ani sponsorowany przez Instytut Meteorologii i Gospodarki Wodnej – Państwowy Instytut Badawczy (IMGW-PIB).
          </Text>
        </Stack>
      </div>
    </footer>
  );
}
