'use client';

import React, { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface FormattedDateProps {
  date: string | Date;
  className?: string;
}

export function FormattedTime({ date, className }: FormattedDateProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <span suppressHydrationWarning className={className}>
        --:--
      </span>
    );
  }

  const d = new Date(date);
  const formatted = isNaN(d.getTime())
    ? '--:--'
    : d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

  return (
    <span suppressHydrationWarning className={className}>
      {formatted}
    </span>
  );
}

export function FormattedDate({ date, className }: FormattedDateProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <span suppressHydrationWarning className={className}>
        --- --
      </span>
    );
  }

  const d = new Date(date);
  const formatted = isNaN(d.getTime())
    ? '--- --'
    : d.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });

  return (
    <span suppressHydrationWarning className={className}>
      {formatted}
    </span>
  );
}

export function FormattedDateTime({ date, className }: FormattedDateProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <span suppressHydrationWarning className={className}>
        --- --, --:--
      </span>
    );
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return (
      <span suppressHydrationWarning className={className}>
        --- --
      </span>
    );
  }

  const dPart = d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const tPart = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <span suppressHydrationWarning className={className}>
      {dPart} {tPart}
    </span>
  );
}
