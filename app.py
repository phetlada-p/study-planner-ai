from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

def db():
    conn = sqlite3.connect("planner.db")
    conn.row_factory = sqlite3.Row
    return conn

def init():
    c = db()
    # เพิ่มคอลัมน์ user_id เพื่อแยกเครื่อง
    c.execute("""CREATE TABLE IF NOT EXISTS subjects(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        name TEXT,
        assigned_date TEXT,
        deadline TEXT,
        difficulty INTEGER
    )""")
    c.commit()
    c.close()

init()

@app.route("/")
def index():
    return send_from_directory('.', 'index.html')

@app.route("/subjects", methods=["GET", "POST"])
def subjects():
    conn = db()
    if request.method == "POST":
        d = request.json
        conn.execute("INSERT INTO subjects(user_id, name,assigned_date,deadline,difficulty) VALUES (?,?,?,?,?)",
                     (d.get("user_id"), d["name"], d.get("assigned_date"), d["deadline"], d.get("difficulty", 1)))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})
    
    # ดึงเฉพาะข้อมูลของ User ID นั้นๆ
    uid = request.args.get("user_id")
    rows = conn.execute("SELECT * FROM subjects WHERE user_id = ?", (uid,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/delete_subject/<int:id>", methods=["DELETE"])
def delete_subject(id):
    uid = request.args.get("user_id")
    conn = db()
    conn.execute("DELETE FROM subjects WHERE id = ? AND user_id = ?", (id, uid))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route("/schedule")
def schedule():
    uid = request.args.get("user_id")
    conn = db()
    rows = conn.execute("SELECT * FROM subjects WHERE user_id = ?", (uid,)).fetchall()
    conn.close()
    result = []
    for s in rows:
        try:
            deadline_date = datetime.fromisoformat(s["deadline"])
            days = (deadline_date - datetime.now()).days + 1
            if days <= 0: days = 1
            total_min = [10, 30, 60][s["difficulty"] - 1] * 60
            min_per_day = int(total_min / days)
            result.append({"subject": s["name"], "day_count": days, "min_per_day": min_per_day})
        except: continue
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
