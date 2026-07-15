import IndustryScreen from './IndustryScreen';
import Screen6School from './Screen6School';
import YearScreen from './YearScreen';
import IdealOpportunityScreen from './IdealOpportunityScreen';

/**
 * Onboarding screens 3–6 of the agent-hiring flow:
 * 3 = School · 4 = Year · 5 = Where you want to end up · 6 = Ideal opportunity
 */
export default function OnboardingSteps5to8({
  screen, next, back,
  h1style, substyle,
  // screen 3 (school)
  college, setCollege, fireReferralMilestone,
  // screen 4 (year)
  yearLevel, setYearLevel,
  // screen 5 (career interest)
  selectedIndustries, setSelectedIndustries, targetRoles, setTargetRoles,
  // screen 6 (ideal opportunity — free text, CLIFF extracts the rest)
  goalText, setGoalText, setLocationPref, setLocationCity,
}) {
  return (
    <>
      {/* ── SCREEN 3: Where are you starting from? ── */}
      {screen === 3 && (
        <Screen6School
          college={college}
          onCollegeChange={setCollege}
          onBack={back}
          onNext={() => {
            fireReferralMilestone(college);
            next();
          }}
          nextLabel="Continue →"
        />
      )}

      {/* ── SCREEN 4: What year are you in? ── */}
      {screen === 4 && (
        <YearScreen
          yearLevel={yearLevel}
          setYearLevel={setYearLevel}
          h1style={h1style}
          substyle={substyle}
          onBack={back}
          onNext={next}
        />
      )}

      {/* ── SCREEN 5: Where do you eventually want to end up? ── */}
      {screen === 5 && (
        <IndustryScreen
          selectedIndustries={selectedIndustries}
          setSelectedIndustries={setSelectedIndustries}
          targetRoles={targetRoles}
          setTargetRoles={setTargetRoles}
          onBack={back}
          onNext={next}
        />
      )}

      {/* ── SCREEN 6: Describe your ideal opportunity ── */}
      {screen === 6 && (
        <IdealOpportunityScreen
          goalText={goalText}
          setGoalText={setGoalText}
          setLocationPref={setLocationPref}
          setLocationCity={setLocationCity}
          h1style={h1style}
          substyle={substyle}
          onBack={back}
          onNext={next}
        />
      )}
    </>
  );
}