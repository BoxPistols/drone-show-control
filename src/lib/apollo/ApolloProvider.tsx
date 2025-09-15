'use client';

import { ApolloProvider as Provider } from '@apollo/client/react';
import client from './client';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <Provider client={client}>{children}</Provider>;
}
