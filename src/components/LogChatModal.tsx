import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import type { NewCoffeeChat } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (chat: NewCoffeeChat) => Promise<void>
}

const today = () => new Date().toISOString().slice(0, 10)

export default function LogChatModal({ open, onClose, onSave }: Props) {
  const [personName, setPersonName] = useState('')
  const [personTitle, setPersonTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [chatDate, setChatDate] = useState(today())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  function reset() {
    setPersonName('')
    setPersonTitle('')
    setDepartment('')
    setChatDate(today())
    setNotes('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!personName.trim()) return
    setSaving(true)
    try {
      await onSave({
        person_name: personName.trim(),
        person_title: personTitle.trim() || null,
        department: department.trim() || null,
        chat_date: chatDate,
        notes: notes.trim() || null,
      })
      toast.success('Coffee chat logged! ☕')
      reset()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-30 flex items-end justify-center bg-navy-900/40 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card w-full max-w-md overflow-hidden rounded-b-none p-6 sm:rounded-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-bold">Log a coffee chat ☕</h2>
            <form onSubmit={handleSubmit}>
              <label className="label" htmlFor="pn">
                Who did you chat with?*
              </label>
              <input
                id="pn"
                required
                autoFocus
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Jordan Lee"
                className="input"
              />

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="pt">
                    Their title
                  </label>
                  <input
                    id="pt"
                    value={personTitle}
                    onChange={(e) => setPersonTitle(e.target.value)}
                    placeholder="VP, Engineering"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="dep">
                    Department
                  </label>
                  <input
                    id="dep"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Markets"
                    className="input"
                  />
                </div>
              </div>

              <label className="label mt-3" htmlFor="cd">
                Date
              </label>
              <input
                id="cd"
                type="date"
                value={chatDate}
                max={today()}
                onChange={(e) => setChatDate(e.target.value)}
                className="input"
              />

              <label className="label mt-3" htmlFor="nt">
                Notes (optional)
              </label>
              <textarea
                id="nt"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you talk about?"
                className="input resize-none"
              />

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving…' : 'Log chat'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
