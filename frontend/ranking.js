const API_URL = "http://127.0.0.1:5000";

const nameInput = document.getElementById("player-name");
const rankingList = document.getElementById("ranking-list");
const rankingStatus = document.getElementById("ranking-status");

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

export async function submitScore(score) {
    const name = nameInput.value.trim();
    if (!name) {
        rankingStatus.textContent = "Digite seu nome para entrar no ranking";
        return;
    }
    try {
        await saveScore(name, Math.floor(score));
        await showRanking();
    } catch (err) {
        rankingStatus.textContent = `Não foi possível salvar: ${err.message}`;
    }
}