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

// Global flag from popup settings (controls if the plugin is globally active)
let globalPluginEnabled = true;
// Local flag to let user toggle conversion on/off when plugin is enabled (default true)
let conversionEnabled = true;

function invertMapping(mapping) {
  let inverted = {};
  for (const num in mapping) {
    if (Object.prototype.hasOwnProperty.call(mapping, num)) {
      inverted[mapping[num]] = num;
    }
  }
  return inverted;
}

function isToggleShortcutArray(event){
    const recognizedModifiers = ['alt', 'ctrl', 'shift', 'meta'];

    
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
    }
  },
  (data) => {
    globalPluginEnabled = data.pluginEnabled;
    // Set conversionEnabled to true when plugin is globally enabled.
    conversionEnabled = globalPluginEnabled;
    keyMapping = invertMapping(data.keyMapping);
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

    if (event.altKey && event.key ==="1"){
        event.preventDefault();
        conversionEnabled = !conversionEnabled;
        const status = conversionEnabled ? "enabled" : "disabled";
        showToast(`Conversion is ${status}.`);
        return;
    }

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