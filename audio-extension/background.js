chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "SEND_AUDIO") {

        fetch("http://127.0.0.1:8000/audio", {
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream"
            },
            body: message.audio
        })
        .then(res => res.json())
        .then(data => {
            console.log("✅ Backend response:", data);
        })
        .catch(err => {
            console.error("❌ Background fetch failed:", err);
        });
    }
});