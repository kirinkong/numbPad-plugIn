document.addEventListener("DOMContentLoaded", () => {
  // Reference to DOM elements.
  const pluginToggle = document.getElementById("pluginToggle");
  let inputs = {
    0: document.getElementById("map-0"),
    1: document.getElementById("map-1"),
    2: document.getElementById("map-2"),
    3: document.getElementById("map-3"),
    4: document.getElementById("map-4"),
    5: document.getElementById("map-5"),
    6: document.getElementById("map-6"),
    7: document.getElementById("map-7"),
    8: document.getElementById("map-8"),
    9: document.getElementById("map-9")
  };
  const saveBtn = document.getElementById("saveSettings");

  // Load saved settings from chrome.storage.
  chrome.storage.sync.get(
  {
    pluginEnabled: true,
    keyMapping: {
      0: "m",
      1: ",",
      2: ".",
      3: "/",
      4: "k",
      5: "l",
      6: ";",
      7: "i",
      8: "o",
      9: "p"
    }
  },
  (data) => {
    pluginToggle.checked = data.pluginEnabled;
    for (const key in inputs) {
      if (data.keyMapping[key]) {
        inputs[key].value = data.keyMapping[key];
      }
    }
  }
  );

  // Save settings on button click.
  saveBtn.addEventListener("click", () => {
    console.log("Inputs:", inputs);

    // Build the keyMapping object from the current input values.
    const updatedMapping = {};
    for (const key in inputs) {
      updatedMapping[key] = inputs[key].value.trim().toLowerCase();
    }
    chrome.storage.sync.set(
      {
        //pluginEnabled: pluginToggle.checked,
        keyMapping: updatedMapping
      },
      () => {
        // Simple visual feedback in the popup.
        saveBtn.innerText = "Saved!";
        setTimeout(() => {
          saveBtn.innerText = "Save Settings";
        }, 1500);
      }
    );
  });

  pluginToggle.addEventListener("change", () => {
    // Update the pluginEnabled setting in storage.
    chrome.storage.sync.set({ pluginEnabled: pluginToggle.checked }, () => {
      // Optionally, you can show a toast or some feedback here.
      console.log("Plugin enabled state updated:", pluginToggle.checked);
    });
  });

});