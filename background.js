let timerDuration = 2 * 60 * 60; // 2 hours in seconds
let timeLeft = timerDuration;
let timerRunning = false;
let intervalId = null;
let youtubeTabs = new Set();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("youtube.com")) {
        youtubeTabs.add(tabId);
    }
});

// Detect when a YouTube tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    if (youtubeTabs.has(tabId)) {
        youtubeTabs.delete(tabId);
        if (youtubeTabs.size === 0) {
            pauseTimer();
        }
        if (timeLeft === 0) {
            chrome.runtime.sendMessage({ action: "quizTime" });
        }
    }
});

function pauseTimer() {
    if (!timerRunning) return;

    clearInterval(intervalId);
    timerRunning = false;
    updatePopup();
}

// Function to start the timer
function startTimer() {
    if (timerRunning || youtubeTabs.size === 0) return;


    timerRunning = true;
    intervalId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updatePopup();
        } else {
            clearInterval(intervalId);
            blockYouTube();
        }
    }, 1000);
}

// Function to stop the timer
function stopTimer() {
    clearInterval(intervalId);
    timerRunning = false;
    timeLeft = timerDuration;
    updatePopup();
    allowYouTube();
}

// Function to update the popup timer display
function updatePopup() {
    chrome.runtime.sendMessage({ action: "updateTimer", time: timeLeft });
}

// Function to block YouTube
function blockYouTube() {
    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [{
            id: 1,
            priority: 1,
            action: { type: "block" },
            condition: { urlFilter: "*://www.youtube.com/*" }
        }],
    }, () => {
        chrome.runtime.sendMessage({ action: "quizTime" });
    });
}


// Function to allow YouTube
function allowYouTube() {
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1]
    });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startTimer") {
        startTimer();
    } else if (message.action === "stopTimer") {
        stopTimer();
    } else if (message.action === "unblockYoutube"){
        clearInterval(intervalId);
        timerRunning = false;
        timeLeft = timerDuration;
        allowYouTube();
    } else if (message.action === "getTimer") {
        sendResponse({ time: timeLeft });
    }
});
