import { useEffect, useMemo, useState } from "react";
import "./App.css";

import { createHabit, getHabits, setHabitLog } from "./api/habits.api";
import { getLogs } from "./api/logs.api";

import Header from "./components/Header";
import AddHabitPanel from "./components/AddHabitPanel";
import StatsPanel from "./components/StatsPanel";
import TodoPanel from "./components/TodoPanel";
import AnalyticsPanel from "./components/AnalyticsPanel";
import MonthGrid from "./components/MonthGrid";
import { useAuth } from "./auth/AuthContext";

import {
  isoToday,
  monthStart,
  monthEnd,
  daysInMonth,
  addDays,
  monthLabel,
  weekKeyFromIso,
  keyOf
} from "./utils/date";

import {
  completionForDay,
  completionForMonth,
  computeOverallStreak,
  dailyCompletionSeries,
  habitMonthStats,
  habitLastNDaysStats
} from "./utils/analytics";

import { loadTodos, saveTodos } from "./utils/todo";

export default function App() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState("");
  const [selectedDate, setSelectedDate] = useState(isoToday());
  const [doneMap, setDoneMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const [error, setError] = useState("");
  const [streakThreshold, setStreakThreshold] = useState(60);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 760);

  const { user, logout } = useAuth();

  const totalDays = useMemo(() => daysInMonth(selectedDate), [selectedDate]);
  const yyyyMm = useMemo(() => selectedDate.slice(0, 7), [selectedDate]);

  const fetchRange = useMemo(() => {
    const start = monthStart(selectedDate);
    const end = monthEnd(selectedDate);
    return { from: addDays(start, -120), to: end };
  }, [selectedDate]);

  const activeHabits = useMemo(() => habits.filter((h) => h.active), [habits]);

  const weekKey = useMemo(() => weekKeyFromIso(selectedDate), [selectedDate]);
  const weekStorageKey = useMemo(() => `ozh:todo:week:${weekKey}`, [weekKey]);
  const monthStorageKey = useMemo(() => `ozh:todo:month:${yyyyMm}`, [yyyyMm]);

  const [weekTodos, setWeekTodos] = useState(() => loadTodos(weekStorageKey));
  const [monthTodos, setMonthTodos] = useState(() => loadTodos(monthStorageKey));
  const [weekTodoText, setWeekTodoText] = useState("");
  const [monthTodoText, setMonthTodoText] = useState("");

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 760);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setWeekTodos(loadTodos(weekStorageKey));
  }, [weekStorageKey]);

  useEffect(() => {
    setMonthTodos(loadTodos(monthStorageKey));
  }, [monthStorageKey]);

  useEffect(() => {
    saveTodos(weekStorageKey, weekTodos);
  }, [weekStorageKey, weekTodos]);

  useEffect(() => {
    saveTodos(monthStorageKey, monthTodos);
  }, [monthStorageKey, monthTodos]);

  async function loadAll() {
    setError("");
    setLoading(true);
    try {
      const [h, logs] = await Promise.all([
        getHabits(),
        getLogs(fetchRange.from, fetchRange.to)
      ]);

      setHabits(h);

      const map = {};
      for (const row of logs) {
        const day = String(row.date).slice(0, 10);
        map[keyOf(row.habitId, day)] = !!row.done;
      }
      setDoneMap(map);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [selectedDate]);

  async function addHabit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setError("");
    setLoading(true);
    try {
      await createHabit(trimmed);
      setName("");
      await loadAll();
    } catch (e) {
      setError(e.message || "Failed to add habit");
      setLoading(false);
    }
  }

  async function toggleDone(habitId, isoDay) {
    setError("");
    const k = keyOf(habitId, isoDay);
    setBusyKey(k);

    const next = !doneMap[k];
    setDoneMap((m) => ({ ...m, [k]: next }));

    try {
      await setHabitLog(habitId, isoDay, next);
    } catch (e) {
      setDoneMap((m) => ({ ...m, [k]: !next }));
      setError(e.message || "Failed to update");
    } finally {
      setBusyKey(null);
    }
  }

  const today = isoToday();

  const todayPct = useMemo(
    () => completionForDay(activeHabits, doneMap, today),
    [activeHabits, doneMap, today]
  );

  const selectedDayPct = useMemo(
    () => completionForDay(activeHabits, doneMap, selectedDate),
    [activeHabits, doneMap, selectedDate]
  );

  const monthPct = useMemo(
    () => completionForMonth(activeHabits, doneMap, yyyyMm, totalDays),
    [activeHabits, doneMap, yyyyMm, totalDays]
  );

  const overallStreak = useMemo(
    () => computeOverallStreak(activeHabits, doneMap, today, 120, streakThreshold),
    [activeHabits, doneMap, today, streakThreshold]
  );

  const focusToday = useMemo(
    () => activeHabits.filter((h) => !doneMap[keyOf(h.id, today)]),
    [activeHabits, doneMap, today]
  );

  const last7 = useMemo(
    () => habitLastNDaysStats(activeHabits, doneMap, today, 7),
    [activeHabits, doneMap, today]
  );

  const atRisk = useMemo(() => last7.filter((x) => x.done === 0), [last7]);

  const monthHabitStats = useMemo(
    () => habitMonthStats(activeHabits, doneMap, yyyyMm, totalDays),
    [activeHabits, doneMap, yyyyMm, totalDays]
  );

  const strongest = useMemo(() => {
    if (!monthHabitStats.length) return null;
    return monthHabitStats.reduce(
      (best, cur) => (cur.doneDays > best.doneDays ? cur : best),
      monthHabitStats[0]
    );
  }, [monthHabitStats]);

  const weakest = useMemo(() => {
    if (!monthHabitStats.length) return null;
    return monthHabitStats.reduce(
      (worst, cur) => (cur.doneDays < worst.doneDays ? cur : worst),
      monthHabitStats[0]
    );
  }, [monthHabitStats]);

  const dailySeries = useMemo(
    () => dailyCompletionSeries(activeHabits, doneMap, yyyyMm, totalDays),
    [activeHabits, doneMap, yyyyMm, totalDays]
  );

  const monthAvg = useMemo(() => {
    if (!dailySeries.length) return 0;
    const sum = dailySeries.reduce((acc, d) => acc + d.pct, 0);
    return Math.round(sum / dailySeries.length);
  }, [dailySeries]);

  const bestDay = useMemo(() => {
    if (!dailySeries.length) return null;
    return dailySeries.reduce(
      (best, cur) => (cur.pct > best.pct ? cur : best),
      dailySeries[0]
    );
  }, [dailySeries]);

  function goPrevMonth() {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setMonth(d.getMonth() - 1);
    setSelectedDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  }

  function goNextMonth() {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setMonth(d.getMonth() + 1);
    setSelectedDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  }

  function goToday() {
    setSelectedDate(today);
  }

  function addWeekTodo(e) {
    e.preventDefault();
    const t = weekTodoText.trim();
    if (!t) return;
    setWeekTodos((xs) => [
      { id: crypto.randomUUID(), text: t, done: false },
      ...xs
    ]);
    setWeekTodoText("");
  }

  function addMonthTodo(e) {
    e.preventDefault();
    const t = monthTodoText.trim();
    if (!t) return;
    setMonthTodos((xs) => [
      { id: crypto.randomUUID(), text: t, done: false },
      ...xs
    ]);
    setMonthTodoText("");
  }

  function toggleTodo(kind, id) {
    const setter = kind === "week" ? setWeekTodos : setMonthTodos;
    setter((xs) => xs.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  function removeTodo(kind, id) {
    const setter = kind === "week" ? setWeekTodos : setMonthTodos;
    setter((xs) => xs.filter((x) => x.id !== id));
  }

  const weekDoneCount = useMemo(
    () => weekTodos.filter((t) => t.done).length,
    [weekTodos]
  );
  const monthDoneCount = useMemo(
    () => monthTodos.filter((t) => t.done).length,
    [monthTodos]
  );

  if (isMobile) {
    return (
      <div className="mobileWrap">
        <div className="mobileTopBar">
          <div className="mobileUserChip">
            <span className="userDot"></span>
            <span className="mobileUserName">{user?.name}</span>
          </div>
          <button className="ghost mobileLogoutBtn" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="mobileMonthBar">
          <button className="ghost" onClick={goPrevMonth}>←</button>
          <div className="mobileMonthCenter">
            <div className="mobileMonthTitle">{monthLabel(selectedDate)}</div>
            <div className="mobileMonthMeta">
              {activeHabits.length} habits • {totalDays} days
            </div>
          </div>
          <button className="ghost" onClick={goNextMonth}>→</button>
        </div>

        <div className="mobileStatsGrid">
          <div className="mobileStatCard">
            <div className="mobileStatLabel">Today</div>
            <div className="mobileStatValue">{todayPct}%</div>
          </div>
          <div className="mobileStatCard">
            <div className="mobileStatLabel">Month</div>
            <div className="mobileStatValue">{monthPct}%</div>
          </div>
          <div className="mobileStatCard">
            <div className="mobileStatLabel">Streak</div>
            <div className="mobileStatValue">🔥 {overallStreak}</div>
          </div>
        </div>

        <section className="mobileCard">
          <div className="mobileSectionTitle">Add Habit</div>
          <AddHabitPanel
            name={name}
            setName={setName}
            addHabit={addHabit}
            loading={loading}
            error={error}
            habits={activeHabits}
            reload={loadAll}
          />
        </section>

        <section className="mobileCard">
          <div className="mobileSectionHead">
            <div className="mobileSectionTitle">Today Pending</div>
            <button className="ghost mini" onClick={goToday}>Today</button>
          </div>

          <div className="mobilePendingList">
            {focusToday.length ? (
              focusToday.map((h) => (
                <div key={h.id} className="mobilePendingRow">
                  <div className="mobilePendingName">{h.name}</div>
                  <button
                    className="mini"
                    onClick={() => toggleDone(h.id, today)}
                  >
                    Mark ✓
                  </button>
                </div>
              ))
            ) : (
              <div className="muted">All habits done today.</div>
            )}
          </div>
        </section>

        <section className="mobileCard">
          <div className="mobileSectionHead">
            <div className="mobileSectionTitle">Month Grid</div>
            <input
              className="mobileDateInput"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {activeHabits.length === 0 && !loading ? (
            <div className="muted">No habits yet. Add one.</div>
          ) : null}

          <MonthGrid
            activeHabits={activeHabits}
            totalDays={totalDays}
            yyyyMm={yyyyMm}
            doneMap={doneMap}
            busyKey={busyKey}
            toggleDone={toggleDone}
          />

          <div className="footNote">Tap cells to mark habits.</div>
        </section>

        <section className="mobileCard">
          <div className="mobileSectionTitle">Quick Insights</div>
          <div className="mobileInsightList">
            <div className="mobileInsightItem">
              <span>Selected day</span>
              <strong>{selectedDayPct}%</strong>
            </div>
            <div className="mobileInsightItem">
              <span>Best day</span>
              <strong>{bestDay ? `${bestDay.pct}%` : "—"}</strong>
            </div>
            <div className="mobileInsightItem">
              <span>Strongest</span>
              <strong>{strongest ? strongest.name : "—"}</strong>
            </div>
            <div className="mobileInsightItem">
              <span>Weakest</span>
              <strong>{weakest ? weakest.name : "—"}</strong>
            </div>
            <div className="mobileInsightItem">
              <span>At risk</span>
              <strong>{atRisk.length}</strong>
            </div>
          </div>
        </section>

        <section className="mobileCard">
          <div className="mobileSectionTitle">To-do</div>
          <TodoPanel
            weekKey={weekKey}
            yyyyMm={yyyyMm}
            weekDoneCount={weekDoneCount}
            weekTodos={weekTodos}
            weekTodoText={weekTodoText}
            setWeekTodoText={setWeekTodoText}
            addWeekTodo={addWeekTodo}
            monthDoneCount={monthDoneCount}
            monthTodos={monthTodos}
            monthTodoText={monthTodoText}
            setMonthTodoText={setMonthTodoText}
            addMonthTodo={addMonthTodo}
            toggleTodo={toggleTodo}
            removeTodo={removeTodo}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="userBar">
        <div className="userChip">
          <span className="userDot"></span>
          <span className="userName">{user?.name}</span>
        </div>

        <button className="ghost logoutBtn" onClick={logout}>
          Logout
        </button>
      </div>

      <Header
        monthLabelText={monthLabel(selectedDate)}
        activeCount={activeHabits.length}
        totalDays={totalDays}
        goPrevMonth={goPrevMonth}
        goNextMonth={goNextMonth}
        goToday={goToday}
      />

      <main className="grid2">
        <section className="card">
          <AddHabitPanel
            name={name}
            setName={setName}
            addHabit={addHabit}
            loading={loading}
            error={error}
            habits={activeHabits}
            reload={loadAll}
          />

          <StatsPanel
            todayPct={todayPct}
            today={today}
            selectedDayPct={selectedDayPct}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            monthPct={monthPct}
            yyyyMm={yyyyMm}
            overallStreak={overallStreak}
            streakThreshold={streakThreshold}
            setStreakThreshold={setStreakThreshold}
          />

          <TodoPanel
            weekKey={weekKey}
            yyyyMm={yyyyMm}
            weekDoneCount={weekDoneCount}
            weekTodos={weekTodos}
            weekTodoText={weekTodoText}
            setWeekTodoText={setWeekTodoText}
            addWeekTodo={addWeekTodo}
            monthDoneCount={monthDoneCount}
            monthTodos={monthTodos}
            monthTodoText={monthTodoText}
            setMonthTodoText={setMonthTodoText}
            addMonthTodo={addMonthTodo}
            toggleTodo={toggleTodo}
            removeTodo={removeTodo}
          />

          {loading ? <div className="muted">Loading…</div> : null}
        </section>

        <section className="card">
          <div className="cardHead">
            <h2>Month Grid</h2>
            <div className="legend">
              <span className="dot done" /> done
              <span className="dot" /> pending
            </div>
          </div>

          <AnalyticsPanel
            monthAvg={monthAvg}
            bestDay={bestDay}
            dailySeries={dailySeries}
            streakThreshold={streakThreshold}
            focusToday={focusToday}
            activeHabits={activeHabits}
            atRisk={atRisk}
            strongest={strongest}
            weakest={weakest}
            totalDays={totalDays}
            toggleDone={toggleDone}
            today={today}
          />

          {activeHabits.length === 0 && !loading ? (
            <div className="muted">No habits yet. Add one.</div>
          ) : null}

          <MonthGrid
            activeHabits={activeHabits}
            totalDays={totalDays}
            yyyyMm={yyyyMm}
            doneMap={doneMap}
            busyKey={busyKey}
            toggleDone={toggleDone}
          />

          <div className="footNote">Click any cell to toggle ✅ (saved to PostgreSQL).</div>
        </section>
      </main>

      <footer className="foot">
        Phase 3 shipped: month grid + ticks + completion + streak + analytics + to-do.
      </footer>
    </div>
  );
}