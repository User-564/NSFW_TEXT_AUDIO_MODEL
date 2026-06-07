// keeps extension alive (required by Chrome MV3)
chrome.runtime.onInstalled.addListener(() => {
    console.log("✅ Text Moderator Extension Installed");
});