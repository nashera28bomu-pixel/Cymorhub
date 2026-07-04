/* search.js — live text search across project name + short description.
   Works together with the category filter chips in projects.js; both
   read/write the same window.CymorProjects state. */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("project-search");
  if (!input) return;

  let debounceTimer = null;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      window.CymorProjects.currentQuery = input.value;
      if (typeof renderProjects === "function") renderProjects();
    }, 150);
  });
});
