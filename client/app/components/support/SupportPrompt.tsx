'use client';

import { Anchor, Button, Modal, Stack, Text } from '@mantine/core';
import Image from 'next/image';
import { SUPPORT_URL } from '../../constants/support';
import { useSupportPromptStore } from '../../hooks/useSupportPromptStore';

export default function SupportPrompt() {
  const opened = useSupportPromptStore((state) => state.opened);
  const close = useSupportPromptStore((state) => state.close);

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Przydają Ci się HydroDane?"
      centered
      size="sm"
      padding="lg"
      radius="lg"
      closeButtonProps={{ 'aria-label': 'Zamknij prośbę o wsparcie' }}
    >
      <Stack gap="md" align="center" ta="center">
        <Text size="sm">
          Jeśli korzystasz z wykresów, możesz pomóc utrzymać i rozwijać stronę,
          stawiając mi symboliczną kawę. Każde wsparcie ma znaczenie — dziękuję!
        </Text>
        <Anchor
          href={SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          display="block"
          w="50%"
          maw={300}
          lh={0}
          onClick={close}
        >
          <Image
            src="/images/buycoffee-button.png"
            alt="Postaw kawę na buycoffee.to"
            width={500}
            height={131}
            sizes="(max-width: 360px) 80vw, 300px"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </Anchor>
        <Button variant="subtle" color="gray" size="sm" onClick={close}>
          Może później
        </Button>
      </Stack>
    </Modal>
  );
}
