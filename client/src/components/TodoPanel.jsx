export default function TodoPanel({
  weekKey,
  yyyyMm,
  weekDoneCount,
  weekTodos,
  weekTodoText,
  setWeekTodoText,
  addWeekTodo,
  monthDoneCount,
  monthTodos,
  monthTodoText,
  setMonthTodoText,
  addMonthTodo,
  toggleTodo,
  removeTodo
}) {
  return (
    <div className="todoBlock">
      <div className="todoHead">
        <h2>To-do</h2>
        <div className="todoMeta">Week starts: {weekKey} • Month: {yyyyMm}</div>
      </div>

      <div className="todoGrid">
        <div className="todoCard">
          <div className="todoTitle">
            <span>Weekly</span>
            <span className="todoCount">{weekDoneCount}/{weekTodos.length}</span>
          </div>

          <form onSubmit={addWeekTodo} className="todoRow">
            <input
              value={weekTodoText}
              onChange={(e) => setWeekTodoText(e.target.value)}
              placeholder="Add weekly task…"
              maxLength={80}
            />
            <button type="submit" className="ghost">Add</button>
          </form>

          <div className="todoList">
            {weekTodos.length ? weekTodos.map((t) => (
              <div key={t.id} className={`todoItem ${t.done ? "done" : ""}`}>
                <button className="todoCheck" onClick={() => toggleTodo("week", t.id)} type="button">
                  {t.done ? "✓" : ""}
                </button>
                <div className="todoText" title={t.text}>{t.text}</div>
                <button className="todoDel" onClick={() => removeTodo("week", t.id)} type="button">
                  ×
                </button>
              </div>
            )) : <div className="muted">No weekly tasks yet.</div>}
          </div>
        </div>

        <div className="todoCard">
          <div className="todoTitle">
            <span>Monthly</span>
            <span className="todoCount">{monthDoneCount}/{monthTodos.length}</span>
          </div>

          <form onSubmit={addMonthTodo} className="todoRow">
            <input
              value={monthTodoText}
              onChange={(e) => setMonthTodoText(e.target.value)}
              placeholder="Add monthly task…"
              maxLength={80}
            />
            <button type="submit" className="ghost">Add</button>
          </form>

          <div className="todoList">
            {monthTodos.length ? monthTodos.map((t) => (
              <div key={t.id} className={`todoItem ${t.done ? "done" : ""}`}>
                <button className="todoCheck" onClick={() => toggleTodo("month", t.id)} type="button">
                  {t.done ? "✓" : ""}
                </button>
                <div className="todoText" title={t.text}>{t.text}</div>
                <button className="todoDel" onClick={() => removeTodo("month", t.id)} type="button">
                  ×
                </button>
              </div>
            )) : <div className="muted">No monthly tasks yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}