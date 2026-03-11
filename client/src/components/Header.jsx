export default function Header({ monthLabelText, activeCount, totalDays, goPrevMonth, goNextMonth, goToday }) {
  return (
    <header className="topbar">
      <div>
        <h1>Ozhukkam Tracker</h1>
      </div>

      <div className="monthControls">
        <button className="ghost" onClick={goPrevMonth}>←</button>

        <div className="monthBox">
          <div className="monthTitle">{monthLabelText}</div>
          <div className="monthMeta">{activeCount} habits • {totalDays} days</div>
        </div>

        <button className="ghost" onClick={goNextMonth}>→</button>
        <button onClick={goToday}>Today</button>
      </div>
    </header>
  );
}