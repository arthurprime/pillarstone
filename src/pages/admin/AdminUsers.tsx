import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { useToast } from '../../components/Toast'
import type { Profile } from '../../lib/types'

export default function AdminUsers() {
  const { toast } = useToast()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) {
      toast('Could not load users.', 'error')
    } else {
      setUsers(data ?? [])
    }
    setLoading(false)
  }

  async function updateRole(id: string, role: string) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) { toast('Could not update role.', 'error') } else { toast('Role updated.', 'success'); loadUsers() }
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-ink-900 mb-6">Users</h2>

      <div className="bg-warm-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center text-stone-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-stone-400">No users found.</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="py-3 px-4 font-medium text-ink-900">{u.full_name ?? '-'}</td>
                <td className="py-3 px-4 text-stone-600">{u.email}</td>
                <td className="py-3 px-4 text-stone-600">{u.phone ?? '-'}</td>
                <td className="py-3 px-4">
                  <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)} className="px-2 py-1 border border-stone-300 text-xs bg-warm-white">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                    <option value="agent">agent</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-stone-500 text-xs">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
