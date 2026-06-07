console.log("✅ NSFW Extension Loaded");

/* ==============================
   GLOBALS
============================== */

let audioContext;
let gainNode;
let delayNode;
let sourceNode;

let audioBuffer = [];
let lastSendTime = Date.now();

let muteSegments = [];

/* ==============================
   FLOAT32 → INT16 CONVERSION
============================== */

function floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);

    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
}

/* ==============================
   SEND AUDIO TO BACKEND
============================== */

function sendBufferedAudio() {

    if (audioBuffer.length === 0) return;

    const totalLength = audioBuffer.reduce((s, a) => s + a.length, 0);
    const merged = new Float32Array(totalLength);

    let offset = 0;
    for (let chunk of audioBuffer) {
        merged.set(chunk, offset);
        offset += chunk.length;
    }

    audioBuffer = [];

    fetch("http://127.0.0.1:8000/audio", {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
            "X-Sample-Rate": audioContext.sampleRate
        },
        body: floatTo16BitPCM(merged)
    }).catch(console.error);
}

/* ==============================
   LIVE MUTING LOOP
============================== */

function startModerationLoop(video) {

    setInterval(() => {

        const t = video.currentTime;
        let shouldMute = false;

        for (const seg of muteSegments) {
            if (t >= seg.start && t <= seg.end) {
                shouldMute = true;
                break;
            }
        }

        gainNode.gain.value = shouldMute ? 0 : 1;

        muteSegments = muteSegments.filter(
            seg => seg.end > t - 3
        );

    }, 20);
}

/* ==============================
   ADD MUTE SEGMENT
============================== */

function addMuteSegment(start, end) {

    const OFFSET = 0.25;

    muteSegments.push({
        start: start - OFFSET,
        end: end
    });

    console.log("🔇 Mute scheduled:", start, end);
}

/* ==============================
   AUDIO PIPELINE
============================== */

function attachAudioCapture(video) {

    if (video.dataset.audioAttached === "true") return;
    video.dataset.audioAttached = "true";

    audioContext = new AudioContext();

    sourceNode =
        audioContext.createMediaElementSource(video);

    delayNode = audioContext.createDelay(5.0);
    delayNode.delayTime.value = 0.3; // ⭐ delay buffer

    gainNode = audioContext.createGain();

    sourceNode.connect(delayNode);
    delayNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const processor =
        audioContext.createScriptProcessor(4096, 1, 1);

    sourceNode.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (event) => {

        // ✅ STOP if video paused
        if (video.paused || video.ended) {
            audioBuffer = [];
            return;
        }

        const input =
            event.inputBuffer.getChannelData(0);

        audioBuffer.push(new Float32Array(input));

        if (Date.now() - lastSendTime > 800) { // faster send
            lastSendTime = Date.now();
            sendBufferedAudio();
        }
    };

    startModerationLoop(video);

    document.addEventListener("click", () => {
        audioContext.resume();
    });

    console.log("✅ Audio moderation active");
}

/* ==============================
   VIDEO DETECTOR
============================== */

function detectVideoAndAttach() {
    const video = document.querySelector("video");
    if (video) attachAudioCapture(video);
}

const observer = new MutationObserver(detectVideoAndAttach);

observer.observe(document.body, {
    childList: true,
    subtree: true
});

detectVideoAndAttach();