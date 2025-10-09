// src/pages/JoinGroups.js
import React, { useState } from "react";

function JoinGroups() {
  const [search, setSearch] = useState("");
  const [joinedGroups, setJoinedGroups] = useState([]);

  const groups = [
    { id: 1, name: "CMPS 432", members: 52, topic: "Distributed Systems" },
  ];

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoin = (id) => {
    if (!joinedGroups.includes(id)) {
      setJoinedGroups([...joinedGroups, id]);
    }
  };

  const handleLeave = (id) => {
    setJoinedGroups(joinedGroups.filter((gid) => gid !== id));
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>👥 Join Groups</h2>

      {/* 🔎 Search */}
      <div
        style={{
          marginTop: 20,
          marginBottom: 20,
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            maxWidth: "300px",
            padding: "8px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
      </div>

      <h3>📚 Available Groups</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredGroups.map((g) => {
          const isJoined = joinedGroups.includes(g.id);
          return (
            <div
              key={g.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "15px",
                textAlign: "center",
                background: "#fafafa",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ fontWeight: "bold", fontSize: "16px" }}>{g.name}</p>
              <p style={{ fontSize: "13px", color: "#555" }}>
                {g.members} members
              </p>
              <p style={{ fontSize: "12px", color: "gray" }}>
                Topic: {g.topic}
              </p>

              <button
                onClick={() =>
                  isJoined ? handleLeave(g.id) : handleJoin(g.id)
                }
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  background: isJoined ? "red" : "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                }}
              >
                {isJoined ? "❌ Leave" : "➕ Join"}
              </button>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <p style={{ marginTop: 20, color: "gray" }}>
          No groups match your search.
        </p>
      )}

      {joinedGroups.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>✅ Joined Groups</h3>
          <ul>
            {joinedGroups.map((id) => {
              const g = groups.find((group) => group.id === id);
              return (
                <li key={id} style={{ marginBottom: "5px", color: "#333" }}>
                  {g.name}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default JoinGroups;