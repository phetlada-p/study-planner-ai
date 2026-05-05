from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect("planner.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""CREATE TABLE IF NOT EXISTS subjects(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        assigned_date TEXT,
        deadline TEXT,
        difficulty INTEGER
    )""")
    conn.commit()
    conn.close()

init_db()

@app.route("/")
def index():
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "ไม่พบไฟล์ index.html"

@app.route("/subjects", methods=["GET", "POST"])
def subjects():
    if request.method == "POST":
        d = request.json
        try:
            conn = get_db()
            assigned = d.get("assigned_date") if d.get("assigned_date") else datetime.now().strftime("%Y-%m-%d")
            
            conn.execute("INSERT INTO subjects(name,assigned_date,deadline,difficulty) VALUES (?,?,?,?)",
                         (d["name"], assigned, d["deadline"], int(d.get("difficulty", 1))))
            conn.commit()
            conn.close()
            return jsonify({"ok": True})
        except Exception as e:
            print(f"Error: {e}") 
            return jsonify({"error": str(e)}), 500
    
    conn = get_db()
    rows = conn.execute("SELECT * FROM subjects").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/delete_subject/<int:id>", methods=["DELETE"])
def delete_subject(id):
    conn = get_db()
    conn.execute("DELETE FROM subjects WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route("/schedule")
def schedule():
    conn = get_db()
    # เรียงความยากลงมาเพื่อให้วางแผนวิชาหนักก่อน
    rows = conn.execute("SELECT * FROM subjects ORDER BY difficulty DESC, deadline ASC").fetchall()
    conn.close()
    result = []
    diff_labels = {1: "ง่าย", 2: "ปานกลาง", 3: "ยาก"}
    for s in rows:
        try:
            deadline_date = datetime.fromisoformat(s["deadline"])
            days = (deadline_date - datetime.now()).days + 1
            if days <= 0:
                result.append({"subject": s["name"], "difficulty": diff_labels[s["difficulty"]], "plan": ["⚠️ ถึงกำหนดส่งแล้ว!"]})
                continue
            
            # คำนวณเป็นนาที (ง่าย=10ชม, กลาง=30ชม, ยาก=60ชม)
            total_min = [10, 30, 60][s["difficulty"] - 1] * 60
            min_per_day = int(total_min / days) + (1 if (total_min / days) % 1 > 0 else 0)
            
            result.append({
                "subject": s["name"],
                "difficulty": diff_labels[s["difficulty"]],
                "plan": [f"อ่านวันละ {min_per_day} นาที" for _ in range(days)]
            })
        except: continue
    return jsonify(result)

@app.route("/prioritize")
def prioritize():
    conn = get_db()
    # จุดสำคัญ: เรียงความยาก (DESC) มาก่อน วันส่ง (ASC)
    rows = conn.execute("SELECT * FROM subjects ORDER BY difficulty DESC, deadline ASC").fetchall()
    conn.close()
    diff_labels = {1: "ง่าย", 2: "ปานกลาง", 3: "ยาก"}
    return jsonify([{
        "id": r["id"], "name": r["name"], "deadline": r["deadline"], 
        "difficulty": diff_labels.get(r["difficulty"], "ไม่ระบุ")
    } for r in rows])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
