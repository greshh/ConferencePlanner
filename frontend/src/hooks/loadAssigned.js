/* This function loads the assigned members and committees from a given task via its task ID. */
export async function loadAssigned(id, development) {
  const api_base = development ? "http://localhost:4000" : "";

  try {
    // Fetch assigned members
    const res1 = await fetch(`${api_base}/api/assignments/${Number(id)}`);
    if (!res1.ok) throw new Error(`HTTP ${res1.status}`);
    const data1 = await res1.json();
    const members = Array.isArray(data1) ? data1 : [];

    // Fetch assigned committees
    const res2 = await fetch(`${api_base}/api/task_committees/${Number(id)}`);
    if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
    const data2 = await res2.json();
    const committees = Array.isArray(data2) ? data2 : [];

    return { members, committees, error: null };
  } catch (err) {
    console.error("Failed to load task:", err);
    return { members: [], committees: [], error: "Failed to load task" };
  }
}

