/**
 * Referral Script Manager
 * Generates track-aware, campus-personalized viral copy for SMS and group chat sharing.
 */

const CAMPUS_TRACK_SCRIPTS = {
  finance: {
    smsMessage: "Yo! If you're mapping out finance/IB recruiting lines right now, stop cold applying to portals. CLiFF isolates active {schoolName} alumni inside hiring teams and drafts your warm networking scripts. Use my link to skip the waitlist: {url}",
    groupChatSnippet: "Heads up if anyone is tracking finance recruitment loops — this tool maps our actual school network so you don't get ghosted by automated resume screens: {url}",
  },
  tech: {
    smsMessage: "Hey, check this out if you're hunting for SWE/tech slots. CLiFF bypasses standard boards and finds actual {schoolName} parents & alums on engineering teams who can push your profile inside. Free network scan here: {url}",
    groupChatSnippet: "SWE applications are a total black hole right now. This tool finds teams with our school alums on them and builds optimized resume files. Link: {url}",
  },
  marketing: {
    smsMessage: "Yo, look at this if you're trying to break into agency or brand marketing. CLiFF tracked down hidden slots with active {schoolName} connections on the creative side. Run your own scan before openings close: {url}",
    groupChatSnippet: "For anyone trying to lock down marketing roles this cycle — stop wasting time on public job boards and run a quick alumni track scan here: {url}",
  },
  consulting: {
    smsMessage: "If you're grinding through consulting recruiting right now, check this out. CLiFF maps warm {schoolName} alumni tracks at the top firms so you're not cold applying into a black hole. Tap in: {url}",
    groupChatSnippet: "Anyone targeting consulting this cycle — this tool finds actual {schoolName} alumni at firms and writes your intro scripts. Way better than cold portals: {url}",
  },
  healthcare: {
    smsMessage: "Hey! If you're looking at healthcare or med-adjacent roles, CLiFF maps out active {schoolName} alumni connections in hospital systems and biotech so you're not stuck in the applicant pool. Scan here: {url}",
    groupChatSnippet: "For anyone chasing healthcare/biotech roles — this tool surfaces our school's warm alumni tracks before they ever go public. Worth a look: {url}",
  },
  default: {
    smsMessage: "Yo! If you keep getting ghosted by automated portal filters, check this out. CLiFF maps our active {schoolName} alumni ecosystem and writes your warm outreach lines to insiders. Tap in here to skip the waitlist: {url}",
    groupChatSnippet: "If you're tired of getting ghosted on regular applications, this tool maps out our school's active alumni network for hidden tracks. Check it out: {url}",
  },
};

/**
 * Returns fully formatted, personalized copy strings for the given track.
 * All placeholders are guaranteed to be resolved — no raw tokens leak to clipboard.
 *
 * @param {string} track       - Career track key (finance, tech, marketing, etc.)
 * @param {string} schoolName  - Full school name e.g. "University of Florida"
 * @param {string} trackingUrl - Personalized referral URL
 * @returns {{ smsMessage: string, groupChatSnippet: string }}
 */
export function getFormattedScripts(track, schoolName, trackingUrl) {
  const key = (track || '').toLowerCase().trim();
  const scriptBase = CAMPUS_TRACK_SCRIPTS[key] || CAMPUS_TRACK_SCRIPTS.default;

  const format = (text) =>
    text
      .replace(/\{schoolName\}/g, schoolName || 'our school')
      .replace(/\{url\}/g, trackingUrl || '');

  return {
    smsMessage: format(scriptBase.smsMessage),
    groupChatSnippet: format(scriptBase.groupChatSnippet),
  };
}

export { CAMPUS_TRACK_SCRIPTS };