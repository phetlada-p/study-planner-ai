// ฟังก์ชัน: เพิ่มวิชา
function addSubject() {
    const subject = document.getElementById("name").value;
    const assigned = document.getElementById("assigned_date").value;
    const deadline = document.getElementById("deadline").value;
    const difficulty = document.getElementById("difficulty").value;

    if (!subject || !deadline) return alert("กรุณากรอกชื่อวิชาและวันส่งให้ครบถ้วน!");

    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");

    const newSubject = {
        id: Date.now(),
        name: subject,
        assigned_date: assigned || new Date().toISOString().split('T')[0],
        deadline: deadline,
        difficulty: parseInt(difficulty)
    };

    subjects.push(newSubject);
    localStorage.setItem("my_study_data", JSON.stringify(subjects));

    alert("บันทึกลงเครื่องเรียบร้อยแล้ว!");
    document.getElementById("name").value = "";
    loadSubjects(); 
}

// ฟังก์ชัน: แสดงรายการที่บันทึก
function loadSubjects() {
    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");
    const list = document.getElementById("subjectList");
    
    if (subjects.length === 0) {
        list.innerHTML = "<p class='text-center text-gray-400'>ยังไม่มีข้อมูลในเครื่องนี้</p>";
        return;
    }

    list.innerHTML = subjects.map(s => `
        <div class="flex justify-between items-center p-4 bg-white border-l-8 border-pink-500 rounded-xl shadow-sm">
            <div>
                <div class="font-bold text-gray-800">${s.name}</div>
                <div class="text-xs text-gray-400">ส่ง: ${s.deadline}</div>
            </div>
            <button onclick="deleteSubject(${s.id})" class="text-red-400 hover:text-red-600 font-bold">ลบ</button>
        </div>`).join('');
}

// ฟังก์ชัน: ลบวิชา
function deleteSubject(id) {
    if(!confirm("ยืนยันการลบรายการนี้?")) return;
    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");
    subjects = subjects.filter(s => s.id !== id);
    localStorage.setItem("my_study_data", JSON.stringify(subjects));
    loadSubjects();
}

// ฟังก์ชัน: ตารางปฏิทิน
function showSchedule() {
    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");
    const result = document.getElementById("result");
    result.innerHTML = "<h3 class='font-bold text-gray-700 mb-4 text-xl'>📅 แผนการอ่านหนังสือ</h3>";

    if (subjects.length === 0) {
        result.innerHTML += "<p class='text-gray-400'>ไม่มีข้อมูลให้คำนวณ</p>";
        return;
    }

    subjects.forEach(s => {
        const deadlineDate = new Date(s.deadline);
        const startDate = new Date(s.assigned_date);
        const diffTime = deadlineDate - startDate;
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (days <= 0) {
            result.innerHTML += `<div class='mb-4'><strong>📘 ${s.name}</strong>: <span class='text-red-500'>⚠️ เลยกำหนดแล้ว</span></div>`;
            return;
        }

        const totalHours = [10, 30, 60][s.difficulty - 1];
        const minutesPerDay = Math.ceil((totalHours * 60) / days);

        let html = `<div class="mb-6">
                        <h4 class="font-bold text-pink-600 mb-2 italic">📘 ${s.name}</h4>
                        <div class="calendar-grid">`;
        for(let i=0; i<days; i++) {
            html += `<div class="calendar-day">
                        <div class="text-[10px] text-gray-400">วันที่ ${i+1}</div>
                        <div class="text-xs font-bold text-gray-700">${minutesPerDay} นาที</div>
                    </div>`;
        }
        result.innerHTML += html + `</div></div>`;
    });
}

// ฟังก์ชัน: เรียงลำดับความสำคัญ (เรียงความยาก 3 -> 1)
function showPriority() {
    let subjects = JSON.parse(localStorage.getItem("my_study_data") || "[]");
    const result = document.getElementById("result");
    
    // เรียงความยากจากมากไปน้อย (ความยาก 3 จะขึ้นก่อน)
    subjects.sort((a, b) => b.difficulty - a.difficulty);

    const labels = {1: "ง่าย", 2: "ปานกลาง", 3: "ยาก"};

    result.innerHTML = "<h3 class='font-bold text-pink-600 mb-4 text-xl underline'>🔥 เรียงลำดับความสำคัญ (ตามความยาก)</h3>";
    result.innerHTML += "<div class='space-y-3'>" + subjects.map((s, i) => 
        `<div class="p-4 bg-white rounded-2xl shadow-sm border border-pink-100">
            <span class="font-bold text-lg text-gray-800">${i+1}. ${s.name}</span>
            <div class="text-sm text-gray-500 italic">ความยาก: ${labels[s.difficulty]} | กำหนดส่ง: ${s.deadline}</div>
        </div>`
    ).join('') + "</div>";
}

// เริ่มต้นโหลดข้อมูล
loadSubjects();
