/* This function loads the details of a task via its task ID. */
export async function loadTask(id) {
  try {
    const res = await fetch(`/api/tasks/get/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to load task:", err);
    return [];
  }
}
