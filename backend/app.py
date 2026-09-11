import os
import sqlite3

from flask import Flask, jsonify, request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "ranking.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")

app = Flask(__name__)

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

    ranking = [dict(rows for row in rows)]
    return jsonify(ranking)

if __name__ == "__main__":
    app.run()