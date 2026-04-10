import { useCallback, useEffect, useState } from 'react'
import {
  createTask,
  deleteTask,
  fetchTasks,
  type Task,
  type TaskPayload,
  type TaskStatus,
  updateTask,
} from './api/tasks'
import './App.css'

const STATUSES: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
]

function emptyForm(): TaskPayload {
  return { title: '', description: '', status: 'TODO' }
}

export default function App() {
  const [filter, setFilter] = useState<TaskStatus | ''>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<TaskPayload>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchTasks(filter === '' ? null : filter)
      setTasks(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    void load()
  }, [load])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editingId != null) {
        await updateTask(editingId, form)
      } else {
        await createTask(form)
      }
      setForm(emptyForm())
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setForm({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
    })
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this task?')) return
    setError(null)
    try {
      await deleteTask(id)
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm())
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
  }

  return (
    <div className="app">
      <header className="header">
        <h1>TaskHub</h1>
        <p className="tagline">
          React + Spring Boot — tasks with filtering and CRUD
        </p>
      </header>

      <section className="toolbar">
        <span className="toolbar-label">Filter</span>
        <div className="filters" role="tablist" aria-label="Filter by status">
          {STATUSES.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={filter === value}
              className={filter === value ? 'filter active' : 'filter'}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="banner error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="layout">
        <section className="panel form-panel" aria-labelledby="form-heading">
          <h2 id="form-heading">{editingId != null ? 'Edit task' : 'New task'}</h2>
          <form onSubmit={onSubmit} className="task-form">
            <label className="field">
              <span>Title</span>
              <input
                required
                maxLength={200}
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Short title"
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                rows={4}
                maxLength={2000}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional details"
              />
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as TaskStatus,
                  }))
                }
              >
                <option value="TODO">To do</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
              </select>
            </label>
            <div className="form-actions">
              <button type="submit" disabled={saving} className="btn primary">
                {saving ? 'Saving…' : editingId != null ? 'Update' : 'Create'}
              </button>
              {editingId != null ? (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel list-panel" aria-labelledby="list-heading">
          <h2 id="list-heading">Tasks</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : tasks.length === 0 ? (
            <p className="muted">No tasks match this filter.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((t) => (
                <li key={t.id} className="task-card">
                  <div className="task-main">
                    <span className={`badge status-${t.status}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                    <h3 className="task-title">{t.title}</h3>
                    {t.description ? (
                      <p className="task-desc">{t.description}</p>
                    ) : null}
                    <p className="task-meta">
                      Updated{' '}
                      {new Date(t.updatedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="task-actions">
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => startEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => void onDelete(t.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
