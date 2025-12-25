// ===================
// Element References
// ===================
const username = document.getElementById("username");
const password = document.getElementById("password");
const taskTitle = document.getElementById("taskTitle");
const priority = document.getElementById("priority");
const taskList = document.getElementById("taskList");

// ===================
// Backend API URL
// ===================
const API = "http://localhost:5000/api"; // local backend during development

// ===================
// Helper Functions
// ===================
function getToken() {
  return localStorage.getItem("token");
}

function showApp() {
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  loadTasks();
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

// ===================
// AUTH FUNCTIONS
// ===================
async function register() {
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // show server-provided message if available
      alert(data.message || "Registration failed");
      return;
    }
    alert(data.message || "Registered! Now login.");
  } catch (err) {
    console.error(err);
    alert("Registration failed.");
  }
}

async function login() {
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      showApp();
    } else {
      alert("Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Login failed");
  }
}

// ===================
// TASK FUNCTIONS
// ===================
async function loadTasks() {
  try {
    const res = await fetch(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const tasks = await res.json();

    taskList.innerHTML = "";
    tasks.forEach(t => {
      const li = document.createElement("li");
      li.className = t.priority.toLowerCase();
      li.innerHTML = `
        ${t.title} (${t.priority})
        <button onclick="editTask('${t._id}','${t.title}','${t.priority}')">Edit</button>
        <button onclick="deleteTask('${t._id}')">Delete</button>
      `;
      taskList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

async function addTask() {
  if (!taskTitle.value) {
    alert("Task title cannot be empty!");
    return;
  }

  try {
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        title: taskTitle.value,
        priority: priority.value
      })
    });
    taskTitle.value = "";
    loadTasks();
  } catch (err) {
    console.error(err);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${API}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    loadTasks();
  } catch (err) {
    console.error(err);
  }
}

function editTask(id, title, prio) {
  const newTitle = prompt("Edit task", title);
  if (!newTitle) return;

  const newPriority = prompt("Priority (Low/Medium/High)", prio);
  if (!newPriority) return;

  fetch(`${API}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      title: newTitle,
      priority: newPriority
    })
  }).then(loadTasks);
}

// ===================
// AUTO LOGIN
// ===================
if (getToken()) showApp();
