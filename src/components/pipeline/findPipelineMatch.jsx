// Safely find the NetworkingPipeline record for an outreach contact.
// Matching priority:
//   1. Contact name + company both match (most precise)
//   2. Contact name alone matches
// NEVER matches by company alone — with two contacts at the same company,
// a company-only match would move the wrong card.
export function findPipelineMatch(records, recipientName, recipientCompany) {
  const name = recipientName?.trim().toLowerCase();
  if (!name) return null;
  const company = recipientCompany?.trim().toLowerCase();

  if (company) {
    const exact = records.find(p =>
      p.alumni_name?.trim().toLowerCase() === name &&
      p.company?.trim().toLowerCase() === company
    );
    if (exact) return exact;
  }

  return records.find(p => p.alumni_name?.trim().toLowerCase() === name) || null;
}