function addSubject() {
    const subject = document.getElementById("subject").value;
    const assigned = document.getElementById("assignedDate").value;
    const deadline = document.getElementById("deadline").value;
    const difficulty = document.getElementById("difficulty").value;

    if (!subject || !assigned || !deadline) return alert("กรอกข้อมูลให้ครบ!");

    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");

    const newSubject = {
        id: Date.now(), 
        name: subject,
        assigned_date: assigned,
        deadline: deadline,
        difficulty: parseInt(difficulty)
    };

    subjects.push(newSubject);

    localStorage.setItem("my_study_data", JSON.stringify(subjects));

    alert("บันทึกข้อมูลลงเครื่องนี้เรียบร้อยแล้ว!");
    document.getElementById("subject").value = "";
    loadSubjects(); // อัปเดตรายการที่โชว์หน้าเว็บ
}

function loadSubjects() {
    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");
    const list = document.getElementById("subjectList");
    
    if (subjects.length === 0) {
        list.innerHTML = "<p style='color:gray;'>ยังไม่มีข้อมูลในเครื่องนี้</p>";
        return;
    }

    list.innerHTML = subjects.map(s => `
        <li>
            <strong>${s.name}</strong> <small>(ส่ง: ${s.deadline})</small>
            <button class="delete-btn" onclick="deleteSubject(${s.id})">ลบ</button>
        </li>`).join('');
}

function deleteSubject(id) {
    if(!confirm("ยืนยันการลบรายการนี้?")) return;
    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");
    subjects = subjects.filter(s => s.id !== id);
    localStorage.setItem("my_study_data", JSON.stringify(subjects));
    loadSubjects();
}

function showSchedule() {
    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");
    const result = document.getElementById("result");
    result.innerHTML = "<h3>📅 ตารางอ่านหนังสือ (เฉพาะเครื่องนี้)</h3>";

    if (subjects.length === 0) {
        result.innerHTML += "<p>ไม่มีข้อมูลให้คำนวณ กรุณาเพิ่มวิชาก่อนครับ</p>";
        return;
    }

    subjects.forEach(s => {
        const deadlineDate = new Date(s.deadline);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const diffTime = deadlineDate - today;
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (days <= 0) {
            result.innerHTML += `<h4>📘 ${s.name}</h4><p style="color:red;">⚠️ เกินกำหนดส่งแล้ว!</p>`;
            return;
        }

        const totalHours = [10, 30, 60][s.difficulty - 1];
        const hoursPerDay = totalHours / days;

        // แปลง ชม. ทศนิยม เป็น ชม. และ นาที
        const h = Math.floor(hoursPerDay);
        const m = Math.round((hoursPerDay - h) * 60);
        let timeText = h > 0 ? `${h} ชม. ` : "";
        timeText += m > 0 ? `${m} นาที` : "";

        let html = `<div style="margin-top:20px; border-bottom: 1px solid #eee; padding-bottom:10px;">
                        <h4>📘 ${s.name} <span class="diff-tag">ระดับ: ${s.difficulty}</span></h4>
                        <div class="calendar-grid">`;
        for(let i=0; i<days; i++) {
            html += `<div class="calendar-day">
                        <span class="day-number">วันที่ ${i+1}</span>
                        <span class="day-hours">⏳ ${timeText}</span>
                    </div>`;
        }
        result.innerHTML += html + `</div></div>`;
    });
}

// ฟังก์ชัน: เรียงลำดับความสำคัญ
function showPriority() {
    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");
    const result = document.getElementById("result");
    
    // เรียงตามวันส่ง (น้อยไปมาก)
    subjects.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    result.innerHTML = "<h3>🔥 ลำดับความสำคัญ (ในเครื่องนี้)</h3>";
    result.innerHTML += "<ol>" + subjects.map(s => 
        `<li><strong>${s.name}</strong> - ส่ง ${s.deadline} (ยากระดับ: ${s.difficulty})</li>`
    ).join('') + "</ol>";
}

// สั่งให้โหลดข้อมูลทันทีที่เปิดหน้าเว็บ
loadSubjects();
