// SINGLE SOURCE OF TRUTH for pipeline columns ↔ NetworkingPipeline statuses.
// Every pipeline view (ApplicationPipeline, PipelineKanbanModal, PremiumPipeline)
// must use these maps so a record always appears in the same column everywhere.

export const STATUS_TO_COLUMN = {
  // Not yet contacted
  identified: 'opportunities',
  matched: 'opportunities',
  manual: 'opportunities',
  draft_ready: 'opportunities',
  // Contact made, awaiting next step
  reached_out: 'reached_out',
  messaged: 'reached_out',
  replied: 'reached_out',
  contacted: 'reached_out',
  secured: 'reached_out',
  coffee_chat: 'reached_out',
  intro_made: 'reached_out',
  no_response: 'reached_out',
  // In the interview process
  interview: 'interviews',
  // Offer received
  offer: 'offers',
};

// When a card is moved INTO a column, this is the status it gets.
export const COLUMN_TO_STATUS = {
  opportunities: 'identified',
  reached_out: 'reached_out',
  interviews: 'interview',
  offers: 'offer',
};

export const getColumnForStatus = (status) => STATUS_TO_COLUMN[status] || 'opportunities';