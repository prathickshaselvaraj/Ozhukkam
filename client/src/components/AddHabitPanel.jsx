import { useState } from "react";
import { updateHabit, deleteHabit } from "../api/habits.api";

export default function AddHabitPanel({
  name,
  setName,
  addHabit,
  loading,
  error,
  habits,
  reload
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  async function handleEditSave(id) {
    if (!editName.trim()) return;

    await updateHabit(id, editName);
    setEditingId(null);
    setEditName("");
    reload();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this habit?")) return;

    await deleteHabit(id);
    reload();
  }

  return (
    <section className="card">
      <h2>Add Habit</h2>

      <form onSubmit={addHabit} className="row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Read 30 min"
        />
        <button type="submit" disabled={loading}>
          Add
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div style={{ marginTop: 20 }}>
        <h3>Your Habits</h3>

        {habits.map((h) => (
          <div key={h.id} className="habitManageRow">
            {editingId === h.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button onClick={() => handleEditSave(h.id)}>Save</button>
              </>
            ) : (
              <>
                <span>{h.name}</span>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="ghost"
                    onClick={() => {
                      setEditingId(h.id);
                      setEditName(h.name);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="danger"
                    onClick={() => handleDelete(h.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}