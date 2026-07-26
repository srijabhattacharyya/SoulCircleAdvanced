async function send() {
    const text = document.getElementById("input").value;

    const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: text })
    });

    const data = await response.json();

    const box = document.getElementById("chatbox");

    box.innerHTML += `<p><b>You:</b> ${text}</p>`;
    box.innerHTML += `<p><b>AI:</b> ${data.message || JSON.stringify(data)}</p>`;
}