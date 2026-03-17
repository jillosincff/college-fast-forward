import React from 'react';
import ConnectionsCheck from '@/components/connections-check/ConnectionsCheck';

export default function NetworkEdge({ visible, company, userSchool }) {
  if (!visible) return null;

  return (
    <ConnectionsCheck
      company={company}
      userSchool={userSchool}
      variant="compact"
    />
  );
}