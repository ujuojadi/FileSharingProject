// src/pages/Groups.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || '';

function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: replace with real user id from auth
  const CURRENT_USER_ID = localStorage.getItem('userId') || 'user-demo-1';

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/groups`);
    const data = await res.json();
    setGroups(data);
    setLoading(false);
  }

  async function createGroup(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), userId: CURRENT_USER_ID }),
    });
    if (res.ok) {
      setName('');
      fetchGroups();
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Could not create group'));
    }
    setLoading(false);
  }

  async function joinGroup(groupId) {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: CURRENT_USER_ID }),
    });
    if (res.ok) {
      // go to group page
      navigate(`/groups/${groupId}`);
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Could not join group'));
    }
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Groups</h1>

      <form onSubmit={createGroup} className="mb-6">
        <label className="block mb-2">Create new group</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          className="border px-3 py-2 mr-2"
        />
        <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">
          Create
        </button>
      </form>

      <div>
        <h2 className="text-xl mb-2">Available groups</h2>
        {loading && <div>Loading...</div>}
        {!loading && groups.length === 0 && <div>No groups yet</div>}
        <ul>
          {groups.map(g => (
            <li key={g.id} className="mb-3 flex items-center justify-between border p-3 rounded">
              <div>
                <div className="font-semibold">{g.name}</div>
                <div className="text-sm text-gray-500">Created: {new Date(g.created_at).toLocaleString()}</div>
              </div>
              <div>
                <button
                  onClick={() => navigate(`/groups/${g.id}`)}
                  className="mr-2 px-3 py-1 border rounded"
                >
                  View
                </button>
                <button
                  onClick={() => joinGroup(g.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Join
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Groups;
