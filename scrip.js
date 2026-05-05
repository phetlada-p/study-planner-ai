const API = ""; // ปล่อยว่างถ้าอยู่บน Render เดียวกัน

// ฟังก์ชันเพิ่มวิชา
async function addSubject() {
    const name = document.getElementById('name').value;
    const deadline = document.getElementById('deadline').value;
    const assigned = document.getElementById('assigned_date').value;
    const difficulty = document.getElementById('difficulty').value;

    if (!name || !deadline) {
        alert("กรุณากรอกชื่อวิชาและวันส่งให้ครบถ้วนครับ");
        return;
    }

    const payload = {
        name: name,
        deadline: deadline,
        assigned_date: assigned || new Date().toISOString().split('T')[0],
        difficulty: parseInt(difficulty)
    };

    try {
        const response = await fetch(`${API}/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            location.reload(); // บันทึกสำเร็จ รีเฟรชหน้า
        } else {
            const err = await response.json();
            alert("เกิดข้อผิดพลาด: " + err.error);
        }
    } catch (error) {
        console.error("Error adding subject:", error);
        alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
}

// ฟังก์ชันลบวิชา
async function deleteSubject(id) {
    if (confirm("คุณต้องการลบวิชานี้ใช่หรือไม่?")) {
        await fetch(`${API}/delete_subject/${id}`, { method: 'DELETE' });
        location.reload();
    }
}

// ฟังก์ชันโหลดลำดับความสำคัญ (จัดเรียงตามที่ Backend ส่งมา)
async function loadPriority() {
    const res = await fetch(`${API}/prioritize`);
    const data = await res.json();
    let html = '<h3 class="font-bold text-[#ff4d8d] mb-4 text-xl underline">🔥 ลำดับความสำคัญ (ในเครื่องนี้)</h3>';
    data.forEach((s, i) => {
        html += `
        <div class="mb-3 p-3 bg-white rounded-xl shadow-sm border-l-4 border-red-400">
            <span class="font-bold text-lg text-gray-800">${i + 1}. ${s.name}</span>
            <span class="text-sm text-gray-500 ml-2">(ยาก: ${s.difficulty}, ส่ง: ${s.deadline})</span>
        </div>`;
    });
    document.getElementById('result').innerHTML = html;
}

// ฟังก์ชันโหลดตารางแผนการเรียน (กล่องวันที่)
async function loadSchedule() {
    const res = await fetch(`${API}/schedule`);
    const data = await res.json();
    let html = '';

    if (data.length === 0) {
        html = '<p class="text-center text-gray-400">ไม่มีข้อมูลแผนการเรียน</p>';
    }

    data.forEach(s => {
        html += `
        <div class="mb-10">
            <h3 class="font-bold text-2xl mb-4 text-gray-800 flex items-center gap-2">
                📘 ${s.subject} 
                <span class="text-xs font-normal bg-pink-100 text-pink-600 px-3 py-1 rounded-full">ระดับ ${s.difficulty}</span>
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">`;
        
        s.plan.forEach((p, i) => {
            html += `
            <div class="bg-white border-2 border-pink-100 p-3 rounded-2xl text-center shadow-sm hover:border-pink-300 transition-all">
                <div class="text-pink-500 font-bold text-xs mb-1">วันที่ ${i + 1}</div>
                <div class="text-[10px] text-gray-500 leading-tight">⏳ ${p}</div>
            </div>`;
        });
        html += `</div></div>`;
    });
    document.getElementById('result').innerHTML = html;
}

// โหลดรายการวิชาเมื่อเปิดหน้าเว็บครั้งแรก
async function init() {
    const res = await fetch(`${API}/subjects`);
    const data = await res.json();
    const list = document.getElementById('list');
    
    if (data.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-400 py-6">ยังไม่มีข้อมูลในเครื่องนี้</p>';
        return;
    }

    data.forEach(s => {
        list.innerHTML += `
        <div class="flex justify-between items-center p-5 bg-white border-l-8 border-pink-500 rounded-2xl shadow-sm transition-transform hover:scale-[1.01]">
            <div>
                <div class="font-bold text-xl text-gray-800">${s.name}</div>
                <div class="text-sm text-gray-400 italic">กำหนดส่ง: ${s.deadline}</div>
            </div>
            <button onclick="deleteSubject(${s.id})" class="bg-red-100 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>`;
    });
}

init();
