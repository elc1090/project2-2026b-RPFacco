const LOCAL_HOSTS = ["localhost", "127.0.0.1"];
const API_URL = LOCAL_HOSTS.includes(location.hostname)
    ? "http://127.0.0.1:5000"
    : "https://rpfacco.pythonanywhere.com";

const nameInput = document.getElementById("player-name");
const rankingList = document.getElementById("ranking-list");
const rankingStatus = document.getElementById("ranking-status");
const saveButton = document.getElementById("save-score");

let pendingScore = null;

nameInput.value = localStorage.getItem("playerName") ?? "";
nameInput.addEventListener("input", () => {
    localStorage.setItem("playerName", nameInput.value);
});

async function getRanking() {
    const response = await fetch(`${API_URL}/api/ranking`);
    if (!response.ok) throw new Error("erro no servidor");
    return response.json();
}

async function saveScore(name, score) {
    const response = await fetch(`${API_URL}/api/ranking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

export async function showRanking() {
    try {
        const ranking = await getRanking();
        rankingList.replaceChildren();
        ranking.forEach((entry) => {
            const li = document.createElement("li");
            li.textContent = `${entry.name} - ${entry.score}`;
            rankingList.append(li);
        });
        rankingStatus.textContent = ranking.length === 0 ? "Ninguém jogou ainda" : "";
    } catch (err) {
        rankingStatus.textContent = "Não foi possível carregar o ranking";
    }
}

async function savePendingScore() {
    if (pendingScore === null) return;

    const name = nameInput.value.trim();
    if (!name) {
        rankingStatus.textContent = "Digite seu nome e toque em Salvar";
        nameInput.focus();
        return;
    }

    saveButton.disabled = true;
    const saved = pendingScore;
    try {
        await saveScore(name, saved);
        pendingScore = null;
        await showRanking();
        rankingStatus.textContent = `Score ${saved} salvo!`;
    } catch (err) {
        saveButton.disabled = false;
        rankingStatus.textContent = `Não foi possível salvar: ${err.message}`;
    }
}

saveButton.addEventListener("click", savePendingScore);

export async function offerSave(score) {
    pendingScore = Math.floor(score);
    saveButton.disabled = false;
    if (nameInput.value.trim()) {
        await savePendingScore();
    } else {
        rankingStatus.textContent = "Digite seu nome e toque em Salvar";
    }
}