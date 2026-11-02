const boolKeys = ['phuljhadiCursor', 'rocketSend', 'searchDecor', 'lightningBars'];

chrome.storage.local.get([...boolKeys, 'phuljhadiColor'], (res) => {
  boolKeys.forEach(k => {
    document.getElementById(k).checked = res[k] !== false;
  });
  if (res.phuljhadiColor) {
    document.getElementById('phuljhadiColor').value = res.phuljhadiColor;
  }
});

boolKeys.forEach(k => {
  document.getElementById(k).addEventListener('change', (e) => {
    const val = e.target.checked;
    chrome.storage.local.set({ [k]: val });
    sendMessageToTab({ type: 'UPDATE_SETTING', key: k, value: val });
  });
});

document.getElementById('phuljhadiColor').addEventListener('change', (e) => {
  const val = e.target.value;
  chrome.storage.local.set({ phuljhadiColor: val });
  sendMessageToTab({ type: 'UPDATE_SETTING', key: 'phuljhadiColor', value: val });
});

document.getElementById('testRocket').addEventListener('click', () => {
  sendMessageToTab({ type: 'TEST_ROCKET', mega: false });
});

document.getElementById('testMegaRocket').addEventListener('click', () => {
  sendMessageToTab({ type: 'TEST_ROCKET', mega: true });
});

function sendMessageToTab(msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, msg).catch(() => {});
    }
  });
}
