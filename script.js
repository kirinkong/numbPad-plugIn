let keyMapping = {
  'm': '0',
  ',': '1',
  '.': '2',
  '/': '3',
  'k': '4',
  'l': '5',
  ';': '6',
  'i': '7',
  'o': '8',
  'p': '9'
};

let toggleShortcut = ['alt', '1'];
// alt, ctrl, shift, meta

// Global flag from popup settings (controls if the plugin is globally active)
let globalPluginEnabled = true;
// Local flag to let user toggle conversion on/off when plugin is enabled (default true)
let conversionEnabled = true;

const COMBO_WINDOW = 500;           // ms to complete the combo
let comboBuffer = [];               // [{key, time}, …]
let comboTimer = null;              // Timeout handle

function invertMapping(mapping) {
  let inverted = {};
  for (const num in mapping) {
    if (Object.prototype.hasOwnProperty.call(mapping, num)) {
      inverted[mapping[num]] = num;
    }
  }
  return inverted;
}

////For verion 1 of changing the toggle shortcut
//let currentlyPressed = new Set();
//let toggleComboTriggered = false;

function isToggleComboActive(){
  return toggleShortcut.every(key => currentlyPressed.has(key));
}

// Load saved settings from chrome.storage
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
    },
    shortCutEnabled: true,
    toggleShortcutCloud: ['alt', '1']
  },
  (data) => {
    globalPluginEnabled = data.pluginEnabled;
    keyMapping = invertMapping(data.keyMapping);
    toggleShortcut = data.toggleShortcutCloud;
    // Set conversionEnabled to true when plugin is globally enabled.
    conversionEnabled = data.shortCutEnabled;
  }
);

// Listen for runtime storage changes to keep the settings synced.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.pluginEnabled) {
      globalPluginEnabled = changes.pluginEnabled.newValue;
      // When plugin is disabled, ensure conversionEnabled is false.
      conversionEnabled = globalPluginEnabled;
    }
    if (changes.keyMapping) {
      keyMapping = invertMapping(changes.keyMapping.newValue);
    }
    if (changes.toggleShortcutCloud) {
      toggleShortcut = changes.toggleShortcutCloud.newValue;
    }
  }
});


function showToast(message){
    const toast = document.createElement('div');
    toast.innerText = message;

    Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "10px 15px",
    borderRadius: "5px",
    fontSize: "14px",
    zIndex: 9999,
    opacity: 0.8,
    transition: "opacity 0.5s ease"
  });

  document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 1500);
}

function insertTextAtCursor(input, text){
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;

    input.value = input.value.substring(0, startPos) + text + input.value.substring(endPos);

    input.selectionStart = input.selectionEnd = startPos + text.length;
}

document.addEventListener("keydown", (event) => {
    if (!globalPluginEnabled) return;

    const key = event.key.toLowerCase();
    const now = Date.now();

    if (toggleShortcut.includes(key)) {
      event.preventDefault();

      comboBuffer = comboBuffer.filter(e => e.key !== key);
      comboBuffer.push({key, time: now});

      comboBuffer = comboBuffer.filter(e => now - e.time <= COMBO_WINDOW);
      
      const uniqueKeys = [...new Set(comboBuffer.map(e => e.key))]
    }

    // For version 1 of changing the toggle shortcut
    // currentlyPressed.add(event.key.toLowerCase());
    // if(isToggleComboActive() && !toggleComboTriggered){
    //   toggleComboTriggered = true;
    //   event.preventDefault();
    //   conversionEnabled = !conversionEnabled;

    //   // Update the stored pluginEnabled setting so that state persists.
    //   chrome.storage.sync.set({ shortCutEnabled: conversionEnabled }, () => {
    //     showToast(`Conversion is ${conversionEnabled ? "enabled" : "disabled"}.`);
    //   });

    //   //showToast(`Conversion is ${conversionEnabled ? "enabled" : "disabled"}.`);
    //   return;
    // }

    // if (event.altKey && event.key ==="1"){
    //     event.preventDefault();
    //     conversionEnabled = !conversionEnabled;
    //     const status = conversionEnabled ? "enabled" : "disabled";
    //     showToast(`Conversion is ${status}.`);
    //     return;
    // }

    if(!conversionEnabled) return;

    const activeEl = document.activeElement;
    if 
    (
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable)
    ){
        const key = event.key.toLowerCase();
        if(key in keyMapping){
            event.preventDefault();
            insertTextAtCursor(activeEl, keyMapping[key]);
        }
    }
    
});

document.addEventListener("click", (event) => {
    if (!globalPluginEnabled) return;

    const activeEl = document.activeElement;
    if 
    (
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable)
    ){
        if(conversionEnabled){
            showToast('Conversion is enabled');
        }
        return;
    }
});

document.addEventListener("keyup", (event) => {
  // Remove the released key.
  currentlyPressed.delete(event.key.toLowerCase());
  
  // Reset the toggle state if the combination is no longer active.
  if (!isToggleComboActive()) {
    toggleComboTriggered = false;
  }
});