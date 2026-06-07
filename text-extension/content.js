// console.log("✅ Text moderation running...");

// const API_URL = "http://127.0.0.1:8000/text";


// // =============================
// // Send text to FastAPI
// // =============================
// async function moderateText(text) {
//     try {
//         const res = await fetch(API_URL, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ text })
//         });

//         const data = await res.json();
//         return data.moderated;

//     } catch (e) {
//         return text;
//     }
// }


// // =============================
// // Replace text node
// // =============================
// async function processTextNode(node) {

//     const originalText = node.nodeValue.trim();

//     if (!originalText || originalText.length < 3) return;

//     const moderated = await moderateText(originalText);

//     if (moderated && moderated !== originalText) {
//         node.nodeValue = moderated;
//     }
// }


// // =============================
// // Walk DOM
// // =============================
// function walk(node) {

//     if (node.nodeType === Node.TEXT_NODE) {
//         processTextNode(node);
//         return;
//     }

//     if (
//         node.nodeType === Node.ELEMENT_NODE &&
//         node.nodeName !== "SCRIPT" &&
//         node.nodeName !== "STYLE" &&
//         node.nodeName !== "NOSCRIPT"
//     ) {
//         node.childNodes.forEach(walk);
//     }
// }


// // =============================
// // Initial scan
// // =============================
// walk(document.body);


// // =============================
// // Real-time updates (IMPORTANT)
// // =============================
// const observer = new MutationObserver((mutations) => {

//     mutations.forEach(mutation => {

//         mutation.addedNodes.forEach(node => {
//             walk(node);
//         });

//     });

// });

// observer.observe(document.body, {
//     childList: true,
//     subtree: true
// });


const API_URL = "http://localhost:8050/text";

const processedNodes = new WeakSet();

async function moderateText(node) {

    const text = node.textContent.trim();

    if (!text) return;

    if (processedNodes.has(node)) return;

    processedNodes.add(node);

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        if (data.moderated && data.moderated !== text) {
            node.textContent = data.moderated;
        }

    } catch (error) {
        console.log("Moderation error:", error);
    }
}

function scanPage() {

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;

    while (node = walker.nextNode()) {

        if (node.parentElement &&
            node.parentElement.tagName !== "SCRIPT" &&
            node.parentElement.tagName !== "STYLE") {

            moderateText(node);
        }
    }
}

function observeDOM() {

    const observer = new MutationObserver((mutations) => {

        mutations.forEach((mutation) => {

            mutation.addedNodes.forEach((node) => {

                if (node.nodeType === Node.TEXT_NODE) {
                    moderateText(node);
                }

                if (node.nodeType === Node.ELEMENT_NODE) {

                    const textNodes = node.querySelectorAll("*");

                    textNodes.forEach(el => {

                        el.childNodes.forEach(child => {

                            if (child.nodeType === Node.TEXT_NODE) {
                                moderateText(child);
                            }

                        });

                    });

                }

            });

        });

    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

scanPage();

observeDOM();