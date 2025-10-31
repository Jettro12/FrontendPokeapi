const API_URL = "https://backendpokeapi-production.up.railway.app";

// ===== LOGIN & REGISTRATION =====
async function register() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  console.log("Sending:", { username, password });
  if (!username || !password) {
    document.getElementById("message").innerText =
      "Username and password required";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Response data:", data);
    document.getElementById("message").innerText = res.ok
      ? "✅ User created successfully"
      : `❌ ${data.detail}`;
  } catch (error) {
    document.getElementById("message").innerText = "❌ Server connection error";
  }
}

async function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    document.getElementById("message").innerText =
      "Username and password required";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.access_token);
      window.location.href = "pokedex.html";
    } else {
      document.getElementById("message").innerText = `❌ ${data.detail}`;
    }
  } catch (error) {
    document.getElementById("message").innerText = "❌ Server connection error";
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// ===== POKÉMON SEARCH =====
// ===== UPDATE AND DISPLAY POKÉMON =====

// Load previous history from localStorage (if exists)
let recent = JSON.parse(localStorage.getItem("recent")) || [];

async function searchPokemon() {
  const name = document
    .getElementById("pokemon-name")
    .value.trim()
    .toLowerCase();
  if (!name) return alert("Enter the Pokémon name or number");

  try {
    const res = await fetch(`${API_URL}/pokemon/${name}`);
    if (!res.ok) return alert("Pokémon not found");
    const data = await res.json();

    // Show current Pokémon in main box
    displayPokemon("current", data);

    // Update recent list
    updateRecent(data);

    // Save history in localStorage
    localStorage.setItem("recent", JSON.stringify(recent));
  } catch (error) {
    alert("Error searching Pokémon");
  }
}

function displayPokemon(id, data) {
  const div = document.getElementById(id);
  div.innerHTML = `
    <h3>${data.name.toUpperCase()}</h3>
    <img src="${data.sprite}" alt="${data.name}" />
    <p><b>Height:</b> ${data.height}</p>
    <p><b>Weight:</b> ${data.weight}</p>
    <p><b>Stats:</b></p>
    <ul>
      ${Object.entries(data.stats)
        .map(([k, v]) => `<li>${k}: ${v}</li>`)
        .join("")}
    </ul>
  `;
}

function updateRecent(pokemon) {
  // Avoid duplicates
  recent = recent.filter((p) => p.name !== pokemon.name);

  // Insert at beginning
  recent.unshift(pokemon);

  // Maintain maximum of 3 (1 current + 2 recent)
  if (recent.length > 3) recent = recent.slice(0, 3);

  // Display recent
  if (recent[1]) displayPokemon("recent1", recent[1]);
  else document.getElementById("recent1").innerHTML = "";

  if (recent[2]) displayPokemon("recent2", recent[2]);
  else document.getElementById("recent2").innerHTML = "";
}

// When loading pokedex.html, verify authentication and restore history
if (window.location.pathname.includes("pokedex.html")) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
  } else {
    // Restore recently searched Pokémon
    if (recent[0]) displayPokemon("current", recent[0]);
    if (recent[1]) displayPokemon("recent1", recent[1]);
    if (recent[2]) displayPokemon("recent2", recent[2]);
  }
}
