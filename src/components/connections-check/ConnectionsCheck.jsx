import React, { useState } from 'react';
import ConnectionsTrigger from './ConnectionsTrigger';
import ConnectionsModal from './ConnectionsModal';

/**
 * Main wrapper component that combines trigger + modal
 * Use this in dashboard or results screen
 */
export default function ConnectionsCheck({ company, userSchool, variant = 'default' }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <ConnectionsTrigger
        company={company}
        variant={variant}
        onCheck={() => setShowModal(true)}
      />

      <ConnectionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        company={company}
        userSchool={userSchool}
      />
    </>
  );
}

// Export sub-components for flexible usage
export { ConnectionsTrigger, ConnectionsModal };