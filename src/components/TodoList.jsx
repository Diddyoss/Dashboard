import { useState } from 'react'
import styles from './TodoList.module.css'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
)

export default function TodoList({ todos, setTodos }) {
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const done = todos.filter((t) => t.completed).length

  const add = () => {
    const text = input.trim()
    if (!text) return
    setTodos((prev) => [...prev, { id: uid(), text, completed: false }])
    setInput('')
  }

  const toggle = (id) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))

  const remove = (id) =>
    setTodos((prev) => prev.filter((t) => t.id !== id))

  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const commitEdit = (id) => {
    const text = editText.trim()
    if (text) setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)))
    setEditingId(null)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Checklist</h2>
        <span className={styles.summary}>{done} of {todos.length} done</span>
      </div>

      <div className={styles.addRow}>
        <input
          className={styles.addInput}
          type="text"
          placeholder="Add a task…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className={styles.addBtn} onClick={add} aria-label="Add task">
          <PlusIcon />
        </button>
      </div>

      <ul className={styles.list}>
        {todos.length === 0 && (
          <li className={styles.empty}>No tasks yet — add one above.</li>
        )}
        {todos.map((todo) => (
          <li key={todo.id} className={`${styles.item} ${todo.completed ? styles.completed : ''}`}>
            <button
              className={`${styles.checkbox} ${todo.completed ? styles.checked : ''}`}
              onClick={() => toggle(todo.id)}
              aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {todo.completed && <CheckIcon />}
            </button>

            {editingId === todo.id ? (
              <input
                className={styles.editInput}
                value={editText}
                autoFocus
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => commitEdit(todo.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit(todo.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
              />
            ) : (
              <span
                className={styles.text}
                onClick={() => !todo.completed && startEdit(todo)}
              >
                {todo.text}
              </span>
            )}

            <button className={styles.deleteBtn} onClick={() => remove(todo.id)} aria-label="Delete">
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
