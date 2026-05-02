from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os 

app = Flask(__name__, static_folder='.', static_url_path='')

# ฟังก์ชันเชื่อมต่อฐานข้อมูล
def db():
    # บน Render ไฟล์ .db จะถูกสร้างในโฟลเดอร์โปรเจกต์อัตโนมัติ
    conn = sqlite3.connect("planner.db")
    conn.row_factory = sqlite3.Row
    return conn

# สร้างตารางถ้ายังไม่มี
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

# หน้าแรกสำหรับแสดงเว็บ (ทำให้เพื่อนเข้าลิงก์แล้วเจอหน้าเว็บเลย)
@app.route("/")
def index():
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "ไม่พบไฟล์ index.html ใน Server"

# API: จัดการรายวิชา (ดึงข้อมูล/เพิ่มข้อมูล)
@app.route("/subjects", methods=["GET", "POST"])
def subjects():
    conn = db()
    if request.method == "POST":
        d = request.json
        if not d.get("name") or not d.get("deadline"):
            return jsonify({"error": "Missing data"}), 400
        conn.execute("INSERT INTO subjects(name,assigned_date,deadline,difficulty) VALUES (?,?,?,?)",
                     (d["name"], d["assigned_date"], d["deadline"], d.get("difficulty", 1)))
        conn.commit()
        return jsonify({"ok": True})
    
    rows = conn.execute("SELECT * FROM subjects").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# API: ลบรายวิชา
@app.route("/delete_subject/<int:id>", methods=["DELETE"])
def delete_subject(id):
    conn = db()
    conn.execute("DELETE FROM subjects WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

# API: คำนวณตารางเรียนแบบปฏิทิน
@app.route("/schedule")
def schedule():
    conn = db()
    rows = conn.execute("SELECT * FROM subjects").fetchall()
    conn.close()
    result = []
    diff_labels = {1: "ง่าย", 2: "ปานกลาง", 3: "ยาก"}
    
    for s in rows:
        try:
            if not s["deadline"]: continue
            deadline_date = datetime.fromisoformat(s["deadline"])
            # คำนวณวันคงเหลือ (นับรวมวันนี้ด้วย)
            days = (deadline_date - datetime.now()).days + 1
            
            if days <= 0:
                result.append({"subject": s["name"], "difficulty": diff_labels[s["difficulty"]], "plan": ["⚠️ ถึงกำหนดส่งแล้ว!"]})
                continue

            # ชั่วโมงรวมตามระดับความยาก (10, 30, 60 ชม.)
            total_needed = [10, 30, 60][s["difficulty"] - 1]
            hours_per_day = total_needed / days 

            plan = [f"อ่านวันละ {hours_per_day:.1f} ชม." for i in range(days)]
            
            result.append({
                "subject": s["name"],
                "difficulty": diff_labels[s["difficulty"]],
                "plan": plan
            })
        except: continue
    return jsonify(result)

# API: จัดลำดับความสำคัญ (ด่วน!)
@app.route("/prioritize")
def prioritize():
    conn = db()
    # เรียงตามวันส่งก่อน และระดับความยากจากมากไปน้อย
    rows = conn.execute("SELECT * FROM subjects ORDER BY deadline ASC, difficulty DESC").fetchall()
    conn.close()
    diff_labels = {1: "ง่าย", 2: "ปานกลาง", 3: "ยาก"}
    return jsonify([{
        "name": r["name"], 
        "deadline": r["deadline"], 
        "difficulty": diff_labels.get(r["difficulty"], "ไม่ระบุ")
    } for r in rows])

# ส่วนการรันโปรแกรม (ปรับเพื่อ Render)
if __name__ == "__main__":
    # Render จะส่ง Port มาให้ผ่าน Environment Variable
    port = int(os.environ.get("PORT", 5000))
    # ต้องรัน host เป็น 0.0.0.0 เพื่อให้ภายนอกเข้าถึงได้
    app.run(host='0.0.0.0', port=port, debug=True)
