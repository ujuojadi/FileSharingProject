// src/pages/GroupPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function GroupPage() {
  const { groupId } = useParams();
  const [files, setFiles] = useState([]);
  const [group, setGroup] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const CURRENT_USER_ID = localStorage.getItem('userId') || 'user-demo-1';

  useEffect(() => {
    fetchGroupFiles();
    // fetch group metadata if needed (we have no API; could re-use listing)
    fetchGroupInfo();
  }, [groupId]);

  async function fetchGroupInfo() {
    // try to get groups list and find matching
    const res = await fetch(`${API_BASE}/api/groups`);
    const data = await res.json();
    const g = data.find(x => String(x.id) === String(groupId));
    setGroup(g || { id: groupId, name: 'Group #' + groupId });
  }

  async function fetchGroupFiles() {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/groups/${groupId}/files?userId=${CURRENT_USER_ID}`);
    if (res.ok) {
      const data = await res.json();
      setFiles(data);
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Could not fetch files — make sure you joined the group.'));
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) return alert('Select a file');
    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('userId', CURRENT_USER_ID);

    setLoading(true);
    const res = await fetch(`${API_BASE}/api/groups/${groupId}/files`, {
      method: 'POST',
      body: fd,
    });

    if (res.ok) {
      setSelectedFile(null);
      fetchGroupFiles();
    } else {
      const err = await res.json();
      alert('Upload error: ' + (err.error || 'Unknown error'));
    }
    setLoading(false);
  }

  function downloadFile(fileId) {
    const url = `${API_BASE}/api/groups/${groupId}/files/${fileId}/download?userId=${CURRENT_USER_ID}`;
    // Force browser navigation to download
    window.location.href = url;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Group: {group?.name || `#${groupId}`}</h1>

      <section className="mb-6 border p-4 rounded">
        <h2 className="font-semibold mb-2">Upload file</h2>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <button type="submit" className="ml-2 px-3 py-1 bg-green-600 text-white rounded">Upload</button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Files</h2>
        {loading && <div>Loading...</div>}
        {!loading && files.length === 0 && <div>No files yet</div>}
        <ul>
          {files.map(f => (
            <li key={f.id} className="mb-2 flex items-center justify-between border p-3 rounded">
              <div>
                <div className="font-medium">{f.original_name}</div>
                <div className="text-sm text-gray-500">{f.size} bytes — uploaded by {f.uploaded_by} on {new Date(f.uploaded_at).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={() => downloadFile(f.id)} className="px-3 py-1 bg-blue-600 text-white rounded">Download</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
