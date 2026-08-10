'use client';

import { Text } from '@mantine/core';
import Link from 'next/link';
import styles from './dataOverview.module.css';

const DataOverview = () => (
  <section className={styles.overview} aria-label="Wprowadzenie do aplikacji HydroDane">
    <Text size="sm">
      Wybierz stację, aby przeanalizować jej archiwalne dane hydrologiczne.
    </Text>
    <Link href="/przewodnik" className={styles.guideLink}>
      Zobacz, jak korzystać z aplikacji
    </Link>
  </section>
);

export default DataOverview;
