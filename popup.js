import { roobiks, renderer, keybinds, cubieKeybinds } from "./lib/cube-data.js";

const popup = document.querySelector(".popup");
const overlay = document.querySelector(".popup-overlay");
const title = popup.querySelector(".title");
const content = popup.querySelector(".content-popup");

const popupPages = {
  information: {
    title: "Information",
    html: `
      <div class="info-section">

        <h3>Roobiks</h3>

        <p class="info-description">
          Roobiks is a 3D software rasterizer made with the HTML5 Canvas API.
          It's a proof of concept showcasing the following features:
        </p>

        <div class="info-card">
          <h4>Features</h4>

          <ul>
            <li>Scramble & Solve</li>
            <li>Free camera controls</li>
            <li>Configurable settings</li>
            <li>Perspective projection</li>
            <li>Camera system</li>
            <li>Mouse-look</li>
            <li>Backface culling</li>
            <li>Lambert lighting</li>
            <li>Face sorting</li>
            <li>Wireframe rendering</li>
            <li>Mesh rendering</li>
            <li>Rubik's Cube demo</li>
            <li>Well documented code</li>
          </ul>
        </div>

      </div>
    `,
  },

  keybinds: {
    title: "Keybinds",
    html: `
      <table class="keybind-table">
        <thead>
          <tr>
            <th class="keybind-th-left">Action</th>
            <th class="keybind-th-right">Key</th>
          </tr>
        </thead>

        <tbody id="keybind-table-body"></tbody>
      </table>
    `,
  },

  settings: {
    title: "Settings",
    html: `
      <div class="setting-cnt">

        <div class="setting">
          <label>
            <input id="wireframe-toggle" type="checkbox">
            Wireframe Rendering
          </label>
        </div>

        <div class="setting">
          <label>
            Camera Speed
            <br>
            <input
              id="camera-speed"
              type="range"
              min="0.02"
              max="0.50"
              step="0.01">
          </label>
        </div>

        <div class="setting">
          <label>
            Ambient Light
            <br>
            <input
              id="ambient-light"
              type="range"
              min="0"
              max="1"
              step="0.05">
          </label>
        </div>

      </div>
    `,
  },
};

function openPopup(page) {
  const data = popupPages[page];

  title.textContent = data.title;
  content.innerHTML = data.html;

  popup.style.display = "grid";
  overlay.style.display = "block";

  switch (page) {
    case "settings":
      initializeSettings();
      break;

    case "keybinds":
      initializeKeybinds();
      break;
  }
}

function closePopup() {
  popup.classList.add("pop-out");

  setTimeout(() => {
    popup.classList.remove("pop-out");
    popup.style.display = "none";
    overlay.style.display = "none";
  }, 300);
}

document
  .querySelector(".information")
  .addEventListener("click", () => openPopup("information"));

document
  .querySelector(".keybinds")
  .addEventListener("click", () => openPopup("keybinds"));

document
  .querySelector(".settings")
  .addEventListener("click", () => openPopup("settings"));

document.querySelector(".close").addEventListener("click", closePopup);
overlay.addEventListener("click", closePopup);

function initializeSettings() {
  const wireframe = document.querySelector("#wireframe-toggle");
  const speed = document.querySelector("#camera-speed");
  const ambient = document.querySelector("#ambient-light");

  wireframe.checked = renderer.wireframe;
  speed.value = renderer.keybinds.speed;
  ambient.value = renderer.light.ambient;

  wireframe.addEventListener("change", () => {
    renderer.wireframe = wireframe.checked;
  });

  speed.addEventListener("input", () => {
    renderer.keybinds.speed = Number(speed.value);
  });

  ambient.addEventListener("input", () => {
    renderer.light.ambient = Number(ambient.value);
  });
}

function initializeKeybinds() {
  const tbody = document.querySelector("#keybind-table-body");
  tbody.innerHTML = "";

  const cameraActions = [
    ["Move Forward", keybinds, "keyForward"],
    ["Move Backward", keybinds, "keyBack"],
    ["Move Left", keybinds, "keyLeft"],
    ["Move Right", keybinds, "keyRight"],
    ["Move Up", keybinds, "keyUp"],
    ["Move Down", keybinds, "keyDown"],
    ["Reset Camera", keybinds, "keyReset"],
  ];

  cameraActions.forEach(([name, object, property]) => {
    addEditableRow(tbody, name, object, property);
  });

  addStaticRow(tbody, "Rotate Camera", "Mouse Drag");
  addStaticRow(tbody, "Enable Wireframe", "V");

  Object.entries(cubieKeybinds).forEach(([move]) => {
    if (move != "`") {
      addEditableRow(tbody, `Perform ${move}`, cubieKeybinds, move);
    } else {
      addEditableRow(tbody, `Perform solve`, cubieKeybinds, move);
    }
  });
}

function addStaticRow(tbody, action, value) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${action}</td>
    <td>${value}</td>
  `;

  tbody.appendChild(row);
}

function addEditableRow(tbody, action, object, property) {
  const row = document.createElement("tr");

  const actionCell = document.createElement("td");
  actionCell.textContent = action;

  const keyCell = document.createElement("td");
  keyCell.classList.add("editable-key");
  keyCell.textContent = formatKey(object[property]);

  keyCell.addEventListener("click", () => {
    keyCell.textContent = "Press any key...";

    const listener = (event) => {
      event.preventDefault();

      let key = event.key;

      if (key === " ") key = " ";
      else if (key === "Control") key = "control";
      else key = key.toLowerCase();

      object[property] = key;
      keyCell.textContent = formatKey(key);
    };

    window.addEventListener("keydown", listener, { once: true });
  });

  row.append(actionCell, keyCell);
  tbody.appendChild(row);
}

function formatKey(key) {
  switch (key) {
    case " ":
      return "Space";

    case "control":
      return "Ctrl";

    default:
      return key.toUpperCase();
  }
}
