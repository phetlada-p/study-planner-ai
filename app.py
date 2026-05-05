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
    c.execute("""CREATE TABLE IF NOT EXISTS subjects(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        # ปรับให้รับค่า difficulty เป็นตัวเลขเพื่อการเรียงลำดับ
        conn.execute("INSERT INTO subjects(name,assigned_date,deadline,difficulty) VALUES (?,?,?,?)",
                     (d["name"], d.get("assigned_date"), d["deadline"], int(d.get("difficulty", 1))))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})
    
    rows = conn.execute("SELECT * FROM subjects").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/delete_subject/<int:id>", methods=["DELETE"])
def delete_subject(id):
    conn = db()
    conn.execute("DELETE FROM subjects WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route("/schedule")
def schedule():
    conn = db()
    # เรียงความยาก (3 ไป 1) ในตารางปฏิทินด้วย
    rows = conn.execute("SELECT * FROM subjects ORDER BY difficulty DESC, deadline ASC").fetchall()
    conn.close()
    result = []
    diff_labels = {1: "ง่าย", 2: "ปานกลาง", 3: "ยาก"}
    for s in rows:
        try:
            deadline_date = datetime.fromisoformat(s["deadline"])
            assigned_date = datetime.fromisoformat(s["assigned_date"]) if s["assigned_date"] else datetime.now()
            days = (deadline_date - assigned_date).days + 1
            if days <= 0: days = 1
            total_min = [10, 30, 60][s["difficulty"] - 1] * 60
            min_per_day = int(total_min / days) + (1 if (total_min / days) % 1 > 0 else 0)
            result.append({
                "subject": s["name"],
                "difficulty": diff_labels[s["difficulty"]],
                "plan": [f"{min_per_day} นาที" for _ in range(days)]
            })
        except: continue
    return jsonify(result)

@app.route("/prioritize")
def prioritize():
    conn = db()
    # *** จุดตายตัว: เรียงความยาก DESC (3 ขึ้นก่อน) ***
    rows = conn.execute("SELECT * FROM subjects ORDER BY difficulty DESC, deadline ASC").fetchall()
    conn.close()
    diff_labels = {1: "ง่าย", 2: "ปานกลาง", 3: "ยาก"}
    return jsonify([{"name": r["name"], "deadline": r["deadline"], "difficulty": diff_labels.get(r["difficulty"], "ไม่ระบุ")} for r in rows])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
