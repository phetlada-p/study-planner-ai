// หากใช้ Ngrok ให้เปลี่ยน URL นี้เป็นลิงก์ Ngrok ของคุณ
const API_URL = "http://127.0.0.1:5000";

async function addSubject() {
    const subject = document.getElementById("subject").value;
    const assigned = document.getElementById("assignedDate").value;
    const deadline = document.getElementById("deadline").value;
    const difficulty = document.getElementById("difficulty").value;

    if (!subject || !assigned || !deadline) return alert("กรอกข้อมูลให้ครบ!");

    try {
        await fetch(`${API_URL}/subjects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: subject, assigned_date: assigned,
                deadline: deadline, difficulty: parseInt(difficulty)
            })
        });
        loadSubjects();
        alert("บันทึกแล้ว!");
    } catch (err) { alert("Backend ไม่ทำงาน!"); }
}

async function loadSubjects() {
    const res = await fetch(`${API_URL}/subjects`);
    const data = await res.json();
    const list = document.getElementById("subjectList");
    list.innerHTML = data.map(s => `
        <li>
            <strong>${s.name}</strong> <small>(${s.deadline})</small>
            <button class="delete-btn" onclick="deleteSubject(${s.id})">ลบ</button>
        </li>`).join('');
}

async function deleteSubject(id) {
    if(!confirm("ลบรายการนี้ใช่ไหม?")) return;
    await fetch(`${API_URL}/delete_subject/${id}`, { method: "DELETE" });
    loadSubjects();
}

async function showSchedule() {
    const res = await fetch(`${API_URL}/schedule`);
    const data = await res.json();
    const result = document.getElementById("result");
    result.innerHTML = "<h3>📅 ตารางอ่านหนังสือแบบปฏิทิน</h3>";

    data.forEach(s => {
        let html = `
            <div style="margin-top:20px;">
                <h4>📘 ${s.subject} <span class="diff-tag">ระดับ: ${s.difficulty}</span></h4>
                <div class="calendar-grid">
        `;
        s.plan.forEach((step, index) => {
            const hours = step.split("อ่านวันละ ")[1];
            html += `
                <div class="calendar-day">
                    <span class="day-number">วันที่ ${index+1}</span>
                    <span class="day-hours">⏳ ${hours}</span>
                </div>`;
        });
        result.innerHTML += html + `</div></div>`;
    });
}

async function showPriority() {
    const res = await fetch(`${API_URL}/prioritize`);
    const data = await res.json();
    const result = document.getElementById("result");
    result.innerHTML = "<h3>🔥 ลำดับด่วน (เรียงตามวันส่งและความยาก)</h3>";
    result.innerHTML += "<ol>" + data.map(s => 
        `<li style="margin-bottom:10px;"><strong>${s.name}</strong> - ส่ง ${s.deadline} (${s.difficulty})</li>`
    ).join('') + "</ol>";
}

loadSubjects();