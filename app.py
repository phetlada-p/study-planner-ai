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
        return "ไม่พบไฟล์ index.html ใน Server"

@app.route("/subjects", methods=["GET", "POST"])
def subjects():
    if request.method == "POST":
        d = request.json
        if not d or not d.get("name") or not d.get("deadline"):
            return jsonify({"error": "Missing data"}), 400
        
        try:
            conn = get_db()
            conn.execute("INSERT INTO subjects(name,assigned_date,deadline,difficulty) VALUES (?,?,?,?)",
                         (d["name"], d["assigned_date"], d["deadline"], int(d.get("difficulty", 1))))
            conn.commit()
            conn.close()
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_db()
    rows = conn.execute("SELECT * FROM subjects").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/delete_subject/<int:id>", methods=["DELETE"])
def delete_subject(id):
    try:
        conn = get_db()
        conn.execute("DELETE FROM subjects WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/schedule")
def schedule():
    conn = get_db()
    rows = conn.execute("SELECT * FROM subjects ORDER BY difficulty DESC, deadline ASC").fetchall()
    conn.close()
    
    result = []
    diff_labels = {1: "ง่าย", 2: "ปานกลาง", 3: "ยาก"}
    
    for s in rows:
        try:
            if not s["deadline"]: continue
            deadline_date = datetime.fromisoformat(s["deadline"])
            # คำนวณวันคงเหลือ
            days = (deadline_date - datetime.now()).days + 1
            
            if days <= 0:
                result.append({
                    "subject": s["name"], 
                    "difficulty": diff_labels.get(s["difficulty"], "ไม่ระบุ"), 
                    "plan": ["⚠️ ถึงกำหนดส่งแล้ว!"]
                })
                continue

            total_hours = [10, 30, 60][s["difficulty"] - 1]
            total_minutes = total_hours * 60
            
            # คำนวณนาทีต่อวัน (ใช้ปัดเศษขึ้นเพื่อให้ครอบคลุมเวลาอ่าน)
            minutes_per_day = total_minutes / days
            if minutes_per_day % 1 > 0:
                minutes_per_day = int(minutes_per_day) + 1
            else:
                minutes_per_day = int(minutes_per_day)

            plan = [f"อ่านวันละ {minutes_per_day} นาที" for i in range(days)]
            
            result.append({
                "subject": s["name"],
                "difficulty": diff_labels.get(s["difficulty"], "ไม่ระบุ"),
                "plan": plan
            })
        except:
            continue
    return jsonify(result)

@app.route("/prioritize")
def prioritize():
    conn = get_db()
    rows = conn.execute("SELECT * FROM subjects ORDER BY difficulty DESC, deadline ASC").fetchall()
    conn.close()
    
    diff_labels = {1: "ง่าย", 2: "ปานกลาง", 3: "ยาก"}
    return jsonify([{
        "id": r["id"],
        "name": r["name"], 
        "deadline": r["deadline"], 
        "difficulty": diff_labels.get(r["difficulty"], "ไม่ระบุ")
    } for r in rows])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
