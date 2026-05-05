const API = ""; 

async function addSubject() {
    const name = document.getElementById('name').value;
    const deadline = document.getElementById('deadline').value;
    const assigned = document.getElementById('assigned_date').value;
    const difficulty = document.getElementById('difficulty').value;

    if (!name || !deadline) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    const res = await fetch(`${API}/subjects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name: name,
            deadline: deadline,
            assigned_date: assigned,
            difficulty: parseInt(difficulty)
        })
    });

    if (res.ok) location.reload();
}

async function init() {
    try {
        const res = await fetch(`${API}/subjects`);
        const data = await res.json();
        const list = document.getElementById('list');
        list.innerHTML = "";
        
        data.forEach(s => {
            list.innerHTML += `
            <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-pink-50 shadow-sm">
                <div>
                    <div class="font-bold text-gray-800">${s.name}</div>
                    <div class="text-[10px] text-gray-400">กำหนดส่ง: ${s.deadline}</div>
                </div>
                <button onclick="deleteSubject(${s.id})" class="text-red-400 hover:text-red-600 font-bold text-sm">ลบ</button>
            </div>`;
        });
    } catch (e) { console.error(e); }
}

async function loadPriority() {
    const res = await fetch(`${API}/prioritize`);
    const data = await res.json();
    let html = "<b>🔥 เรียงตามวันส่ง:</b><br><br>";
    data.forEach((s, i) => {
        html += `${i+1}. <strong>${s.name}</strong> - <small>${s.deadline}</small><br>`;
    });
    document.getElementById('result').innerHTML = html;
}

async function loadSchedule() {
    const res = await fetch(`${API}/schedule`);
    const data = await res.json();
    let html = "<b>📅 แผนการอ่านหนังสือรายวัน:</b><br><br>";
    if (data.length === 0) html += "ยังไม่มีข้อมูล";
    data.forEach((s) => {
        html += `<div class="mb-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-xs">
                    <strong>📘 ${s.subject}</strong>: ${s.plan}
                 </div>`;
    });
    document.getElementById('result').innerHTML = html;
}

async function deleteSubject(id) {
    if (confirm("ต้องการลบวิชานี้ใช่หรือไม่?")) {
        await fetch(`${API}/delete_subject/${id}`, { method: 'DELETE' });
        location.reload();
    }
}

init();
