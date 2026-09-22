import type { Metadata } from 'next';
import Image, { getImageProps, type StaticImageData } from 'next/image';
import Link from 'next/link';
import { Anchor, List, ListItem, Stack, Text, Title } from '@mantine/core';
import Header from '../components/header/Header';
import { Footer } from '../components/footer/Footer';
import guide1 from '../assets/images/1.png';
import guide1Mobile from '../assets/images/1m.png';
import guide2 from '../assets/images/2.png';
import guide2Mobile from '../assets/images/2m.png';
import guide3 from '../assets/images/3.png';
import guide3Mobile from '../assets/images/3m.png';
import guide4a from '../assets/images/4a.png';
import guide4aMobile from '../assets/images/4am.png';
import guide4b from '../assets/images/4b.png';
import guide4bMobile from '../assets/images/4bm.png';
import guide5 from '../assets/images/5.png';
import guide5Mobile from '../assets/images/5m.png';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Przewodnik korzystania z aplikacji',
  description:
    'Przewodnik po wykresach danych hydrologicznych HydroDane: wybór stacji, dane roczne i miesięczne, trend, kalendarz danych oraz charakterystyki hydrologiczne.',
  alternates: {
    canonical: 'https://hydro-dane.vercel.app/przewodnik',
  },
};

type GuideImageProps = {
  desktop: StaticImageData;
  mobile: StaticImageData;
  alt: string;
};

const GuideImage = ({ desktop, mobile, alt }: GuideImageProps) => {
  const { props: mobileImageProps } = getImageProps({
    src: mobile,
    alt,
    sizes: '100vw',
  });

  return (
    <picture className={styles.guidePicture}>
      <source
        media="(max-width: 768px)"
        srcSet={mobileImageProps.srcSet}
      />
      <Image
        src={desktop}
        alt={alt}
        className={styles.guideImage}
        sizes="(max-width: 868px) calc(100vw - 48px), 820px"
      />
    </picture>
  );
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
            <GuideImage
              desktop={guide1}
              mobile={guide1Mobile}
              alt="Wybór stacji pomiarowej w aplikacji HydroDane"
            />
          </section>

          <section>
            <Title order={3}>2. Ustaw rodzaj danych i zakres lat</Title>
            <Text mt="xs">
              Wybierz stan wody, przepływ albo temperaturę wody, a następnie zakres lat. Zakresy dostępne w filtrach zależą od danych zachowanych dla konkretnej stacji.
            </Text>
            <GuideImage
              desktop={guide2}
              mobile={guide2Mobile}
              alt="Filtry rodzaju danych i zakresu lat"
            />
          </section>

          <section>
            <Title order={3}>3. Dane roczne i miesięczne</Title>
            <Text mt="xs">
              Widok roczny ułatwia porównanie kolejnych lat hydrologicznych. Widok miesięczny pokazuje zmianę danych w czasie z większą szczegółowością; można też porównać jeden wybrany miesiąc we wszystkich dostępnych latach. Widok miesięczny pozwala wyświetlić wykres w formie kalendarza, który ułatwia dostrzeżenie sezonowości i nietypowych okresów.
            </Text>
            <GuideImage
              desktop={guide3}
              mobile={guide3Mobile}
              alt="Przełączanie między danymi rocznymi i miesięcznymi"
            />
          </section>

          <section>
            <Title order={3}>4. Wartości i sposób prezentacji</Title>
            <List mt="xs" spacing="xs">
              <ListItem>wartości minimalne, średnie i maksymalne można prezentować jednocześnie lub osobno;</ListItem>
              <ListItem>linia trendu pokazuje kierunek zmian wybranej serii w czasie;</ListItem>
              <ListItem>kalendarz danych miesięcznych pozwala szybko dostrzec sezonowość i nietypowe okresy.</ListItem>
            </List>
            <GuideImage
              desktop={guide4a}
              mobile={guide4aMobile}
              alt="Wykres prezentujący wartości danych hydrologicznych"
            />
            <GuideImage
              desktop={guide4b}
              mobile={guide4bMobile}
              alt="Kalendarz danych miesięcznych"
            />
          </section>

          <section>
            <Title order={3}>5. Charakterystyki i ekstrema</Title>
            <Text mt="xs">
              Pod wykresem rocznym znajdziesz zestawienie charakterystyk stanów lub przepływów oraz ekstremów z dostępnego okresu obserwacji. Skróty w tabeli charakterystyk rozwijają się po najechaniu kursorem.
            </Text>
            <GuideImage
              desktop={guide5}
              mobile={guide5Mobile}
              alt="Charakterystyki i ekstrema danych hydrologicznych"
            />
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

          <Link href="/" className={styles.backLink}>Wróć do wykresów</Link>
        </Stack>
      </article>
    </main>
    <Footer />
  </>
);

export default GuidePage;
