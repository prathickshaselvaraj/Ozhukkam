export default function StatsPanel({
  todayPct,
  today,
  selectedDayPct,
  selectedDate,
  setSelectedDate,
  monthPct,
  yyyyMm,
  overallStreak,
  streakThreshold,
  setStreakThreshold
}) {
  return (
    <div className="stats">
      <div className="stat">
        <div className="statLabel">Today</div>
        <div className="statValue">{todayPct}%</div>
        <div className="statMeta">{today}</div>
      </div>

      <div className="stat">
        <div className="statLabel">Selected day</div>
        <div className="statValue">{selectedDayPct}%</div>
        <div className="statMeta">
          <input
            className="dateInput"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="stat">
        <div className="statLabel">This month</div>
        <div className="statValue">{monthPct}%</div>
        <div className="statMeta">{yyyyMm}</div>
      </div>

      <div className="stat streak">
        <div className="statLabel">Streak</div>
        <div className="statValue">🔥 {overallStreak}</div>
        <div className="statMeta">
          Qualify ≥{" "}
          <select
            className="select"
            value={streakThreshold}
            onChange={(e) => setStreakThreshold(Number(e.target.value))}
          >
            <option value={50}>50%</option>
            <option value={60}>60%</option>
            <option value={70}>70%</option>
            <option value={80}>80%</option>
            <option value={90}>90%</option>
          </select>
        </div>
      </div>
    </div>
  );
}