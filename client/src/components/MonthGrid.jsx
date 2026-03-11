import { keyOf, pad2 } from "../utils/date";

export default function MonthGrid({
  activeHabits,
  totalDays,
  yyyyMm,
  doneMap,
  busyKey,
  toggleDone
}) {
  return (
    <div className="gridWrap">
      <div className="monthGrid" style={{ gridTemplateColumns: `220px repeat(${totalDays}, 34px)` }}>
        <div className="corner">Habits</div>
        {Array.from({ length: totalDays }, (_, i) => (
          <div key={i} className="dayHead">{i + 1}</div>
        ))}

        {activeHabits.map((h) => (
          <div key={h.id} className="habitRow">
            <div className="habitCell" title={h.name}>{h.name}</div>

            {Array.from({ length: totalDays }, (_, i) => {
              const isoDay = `${yyyyMm}-${pad2(i + 1)}`;
              const k = keyOf(h.id, isoDay);
              const done = !!doneMap[k];
              const busy = busyKey === k;

              return (
                <button
                  key={`${h.id}-${isoDay}`}
                  className={`cell ${done ? "done" : ""}`}
                  onClick={() => toggleDone(h.id, isoDay)}
                  disabled={busy}
                  title={isoDay}
                  type="button"
                >
                  {done ? "✓" : ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}