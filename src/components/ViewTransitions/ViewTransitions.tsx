'use client';

import type { ReactNode } from 'react';
import { ViewTransitions as NextViewTransitions } from 'next-view-transitions';

interface ViewTransitionsProps {
  children: ReactNode;
}

export function ViewTransitions({ children }: ViewTransitionsProps) {
  return <NextViewTransitions>{children}</NextViewTransitions>;
}
