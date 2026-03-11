export default function AnalyticsPanel({
  monthAvg,
  bestDay,
  dailySeries,
  streakThreshold,
  focusToday,
  activeHabits,
  atRisk,
  strongest,
  weakest,
  totalDays,
  toggleDone,
  today
}) {
  return (
    <div className="analytics">
      <div className="aCard">
        <div className="aLabel">Month average</div>
        <div className="aValue">{monthAvg}%</div>
        <div className="aMeta">Avg completion per day</div>
      </div>

      <div className="aCard">
        <div className="aLabel">Best day</div>
        <div className="aValue">{bestDay ? `${bestDay.pct}%` : "—"}</div>
        <div className="aMeta">{bestDay ? bestDay.isoDay : "No data"}</div>
      </div>

      <div className="aCard wide">
        <div className="aLabel">Daily completion (this month)</div>
        <div className="spark">
          {dailySeries.map((d) => (
            <div
              key={d.isoDay}
              className={`bar ${d.pct >= streakThreshold ? "q" : ""}`}
              title={`${d.isoDay}: ${d.pct}%`}
              style={{ height: `${Math.max(6, d.pct)}%` }}
            />
          ))}
        </div>
        <div className="aMeta">
          Bars = completion %. Highlight = qualifies (≥ {streakThreshold}%)
        </div>
      </div>

      <div className="aCard wide">
        <div className="aLabel">Action Analytics</div>

        <div className="actionGrid">
          <div className="actionBox">
            <div className="actionTitle">Do now (today pending)</div>
            <div className="actionMeta">{focusToday.length}/{activeHabits.length} habits pending today</div>

            <div className="actionList">
              {focusToday.length ? focusToday.slice(0, 6).map(h => (
                <div key={h.id} className="actionRow">
                  <div className="actionName">{h.name}</div>
                  <button className="mini" onClick={() => toggleDone(h.id, today)} type="button">Mark ✓</button>
                </div>
              )) : <div className="muted">All done for today. Good.</div>}
            </div>
          </div>

          <div className="actionBox">
            <div className="actionTitle">At risk (0/7 last days)</div>
            <div className="actionMeta">Habits with zero activity in last 7 days</div>

            <div className="actionList">
              {atRisk.length ? atRisk.slice(0, 6).map(h => (
                <div key={h.id} className="actionRow">
                  <div className="actionName">{h.name}</div>
                  <div className="chip danger">0/7</div>
                </div>
              )) : <div className="muted">No habits are dead in the last 7 days.</div>}
            </div>
          </div>
        </div>

        <div className="insightStrip">
          <div className="insight">
            <div className="insightLabel">Strongest this month</div>
            <div className="insightValue">{strongest ? strongest.name : "—"}</div>
            <div className="insightMeta">{strongest ? `${strongest.doneDays}/${totalDays} days (${strongest.pct}%)` : "No data yet"}</div>
          </div>

          <div className="insight">
            <div className="insightLabel">Weakest this month</div>
            <div className="insightValue">{weakest ? weakest.name : "—"}</div>
            <div className="insightMeta">{weakest ? `${weakest.doneDays}/${totalDays} days (${weakest.pct}%)` : "No data yet"}</div>
          </div>

          <div className="insight">
            <div className="insightLabel">Streak rule</div>
            <div className="insightValue">≥ {streakThreshold}%</div>
            <div className="insightMeta">Hit this daily to keep streak growing</div>
          </div>
        </div>
      </div>
    </div>
  );
}