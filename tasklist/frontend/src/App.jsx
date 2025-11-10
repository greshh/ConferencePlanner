import React, { useState, useEffect } from 'react'

function App() {
  const [committees, setCommittees] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:3000/committees');
      const data = await res.json();
      setCommittees(Array.isArray(data) ? data : data?.committees ?? []);
    })();
  }, []);

  return (
    <div>
      <h1>committees</h1>
      <ul>
        {committees.map(({ committee_id, committee_name }) => (
          <li key={committee_id}>{committee_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App
