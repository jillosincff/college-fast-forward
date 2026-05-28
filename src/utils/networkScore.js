/**
 * calculateNetworkMatchScore
 *
 * A transparent, data-driven utility that derives a "Network Match Score"
 * purely from verified alumni and parent counts in the CFF database.
 *
 * Every verified company starts at 75% (strong baseline — it's already in the network).
 * Each additional confirmed connection adds incremental weight, capped at 98%.
 *
 * No AI. No guessing. The score moves up only when real people are found.
 */
export const calculateNetworkMatchScore = (alumniCount = 0, parentCount = 0) => {
  const baseScore = 75;
  const totalConnections = alumniCount + parentCount;
  const bonus = Math.min(totalConnections * 2, 23);
  return baseScore + bonus; // Range: 75–98
};