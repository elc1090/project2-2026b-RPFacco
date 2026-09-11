import os
import sqlite3

from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "ranking.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.close()

init_db()

@app.route("/")
def home():
    return jsonify({"message": "Hello Flask!"})

@app.get("/api/ranking")
def get_ranking():
    conn = get_db()
    rows = conn.execute(
        """
        SELECT name, score
        FROM scores
        ORDER BY score DESC, id ASC
        LIMIT 10
        """
    ).fetchall()
    conn.close()

    ranking = [dict(row) for row in rows]
    return jsonify(ranking)

@app.post("/api/ranking")
def post_score():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name") or "").strip()
    score = data.get("score")

    if not name or len(name) > 20:
        return jsonify({"error": "O nome deve ter entre 1 e 20 caracteres"}), 400

    if type(score) is not int or score < 0:
        return jsonify({"error": "O score deve ser um inteiro maior ou igual a zero"}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO scores (name, score) VALUES (?, ?)",
        (name, score),
    )
    conn.commit()
    conn.close()

    return jsonify({"name": name, "score": score}), 201

if __name__ == "__main__":
    app.run(debug=True)