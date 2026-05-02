const API_URL = "https://study-planner-ai-lmlr.onrender.com";

async function addSubject() {
    const subject = document.getElementById("subject").value;
    const assigned = document.getElementById("assignedDate").value;
    const deadline = document.getElementById("deadline").value;
    const difficulty = document.getElementById("difficulty").value;

    if (!subject || !assigned || !deadline) return alert("กรอกข้อมูลให้ครบ!");

    try {
        const response = await fetch(`${API_URL}/subjects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: subject, 
                assigned_date: assigned,
                deadline: deadline, 
                difficulty: parseInt(difficulty)
            })
        });

        if (response.ok) {
            loadSubjects();
            alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
            // ล้างค่าในช่องกรอก
            document.getElementById("subject").value = "";
        } else {
            alert("เกิดข้อผิดพลาดในการบันทึก");
        }
    } catch (err) { 
        console.error(err);
        alert("ติดต่อ Backend ไม่ได้! (รอ Server ตื่นประมาณ 1 นาที)"); 
    }
}

async function loadSubjects() {
    try {
        const res = await fetch(`${API_URL}/subjects`);
        const data = await res.json();
        const list = document.getElementById("subjectList");
        list.innerHTML = data.map(s => `
            <li>
                <strong>${s.name}</strong> <small>(ส่ง: ${s.deadline})</small>
                <button class="delete-btn" onclick="deleteSubject(${s.id})">ลบ</button>
            </li>`).join('');
    } catch (err) {
        console.log("ยังไม่มีข้อมูลหรือ Server ยังไม่พร้อม");
    }
}

async function deleteSubject(id) {
    if(!confirm("ยืนยันการลบรายการนี้?")) return;
    try {
        await fetch(`${API_URL}/delete_subject/${id}`, { method: "DELETE" });
        loadSubjects();
    } catch (err) {
        alert("ไม่สามารถลบได้");
    }
}

async function showSchedule() {
    const res = await fetch(`${API_URL}/schedule`);
    const data = await res.json();
    const result = document.getElementById("result");
    result.innerHTML = "<h3>📅 ตารางอ่านหนังสือแบบปฏิทิน</h3>";

    data.forEach(s => {
        let html = `
            <div style="margin-top:20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                <h4>📘 ${s.subject} <span class="diff-tag">ระดับ: ${s.difficulty}</span></h4>
                <div class="calendar-grid">
        `;
        s.plan.forEach((step, index) => {
            const hours = step.split("อ่านวันละ ")[1] || step;
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
        `<li style="margin-bottom:10px;"><strong>${s.name}</strong> - ส่ง ${s.deadline} (ระดับ: ${s.difficulty})</li>`
    ).join('') + "</ol>";
}

// โหลดข้อมูลทันทีที่เปิดหน้าเว็บ
loadSubjects();
