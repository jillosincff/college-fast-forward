# Base44 Platform Behavior Bugs

## Bug: Scheduler adds 4 hours to UTC input (Confirmed 2026-04-28)

**Description:**
The Base44 automation scheduler applies a +4 hour offset to UTC times specified in the `one_time_date` and `start_time` fields. This causes scheduled automations to fire 4 hours later than intended.

**Evidence:**
- Test case: Input `one_time_date: 2026-04-28T19:01:00` (19:01 UTC)
- Platform stored: `2026-04-28T23:01:00` (23:01 UTC)
- Offset applied: +4 hours
- April 28 correction email: scheduled for 9:30 AM ET (13:30 UTC) but fired at 1:30 PM ET (17:30 UTC) = 4 hour drift

**Workaround:**
To target a specific time, **subtract 4 hours** from your desired UTC time when inputting to the scheduler.

**Example: Schedule a recurring email for 9:30 AM ET daily**
- Goal time: 9:30 AM ET = 13:30 UTC
- Input to scheduler: `start_time: 09:30` (subtract 4 from 13:30)
- Platform applies +4 offset: stores as 13:30 UTC
- Result: fires at 9:30 AM ET ✓

**Testing protocol:**
Always test-fire 5 minutes out before deploying recurring schedules. Compare actual wall-clock fire time against expected time to confirm offset hasn't changed.

**Status:** Active as of 2026-04-28. Pending platform fix.

---

## Workaround (Confirmed April 28)

To target a specific fire time despite the +4 offset:
- **Goal time:** 9:30 AM ET = 13:30 UTC
- **Input to scheduler:** 09:30 UTC
- **Platform stores:** 13:30 UTC (after +4 offset)
- **Result:** Fires at 9:30 AM ET ✓

**Testing protocol:** Always test-fire 5 minutes out before trusting any new recurring schedule. The offset will be applied consistently, allowing you to reverse-engineer the correct input time.