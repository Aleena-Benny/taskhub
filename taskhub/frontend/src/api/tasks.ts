const base = '/api/tasks'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface TaskPayload {
  title: string
  description: string
  status: TaskStatus
}

async function handle(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text()
    let message = text || res.statusText
    try {
      const j = JSON.parse(text) as { error?: string }
      if (j.error) message = j.error
    } catch {
      /* use raw */
    }
    throw new Error(message)
  }
}

export async function fetchTasks(status?: TaskStatus | null): Promise<Task[]> {
  const q =
    status != null ? `?status=${encodeURIComponent(status)}` : ''
  const res = await fetch(`${base}${q}`)
  await handle(res)
  return res.json() as Promise<Task[]>
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  await handle(res)
  return res.json() as Promise<Task>
}

export async function updateTask(
  id: number,
  payload: TaskPayload,
): Promise<Task> {
  const res = await fetch(`${base}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  await handle(res)
  return res.json() as Promise<Task>
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${base}/${id}`, { method: 'DELETE' })
  if (res.status === 204) return
  await handle(res)
}
