const API = ""; 

async function addSubject() {
    const name = document.getElementById('name').value;
    const deadline = document.getElementById('deadline').value;
    const assigned = document.getElementById('assigned_date').value;
    const difficulty = document.getElementById('difficulty').value;

    if (!name || !deadline) return alert("กรุณากรอกข้อมูลให้ครบครับ");

    const data = {
        name: name,
        deadline: deadline,
        assigned_date: assigned,
        difficulty: parseInt(difficulty)
    };

    const res = await fetch(`${API}/subjects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if(res.ok) location.reload();
}

async function init() {
    const res = await fetch(`${API}/subjects`);
    const data = await res.json();
    const list = document.getElementById('subjectList');
    list.innerHTML = ""; // ล้างข้อมูลเก่าก่อนแสดง
    data.forEach(s => {
        list.innerHTML += `
        <div class="flex justify-between items-center p-4 bg-white border-l-8 border-pink-500 rounded-xl shadow-sm mb-2">
            <div><div class="font-bold text-gray-800">${s.name}</div><div class="text-xs text-gray-400">ส่ง: ${s.deadline}</div></div>
            <button onclick="deleteSubject(${s.id})" class="text-red-500 font-bold">ลบ</button>
        </div>`;
    });
}

async function loadPriority() {
    const res = await fetch(`${API}/prioritize`);
    const data = await res.json();
    let html = '<h3 class="font-bold text-pink-600 mb-4 text-xl">🔥 ลำดับความสำคัญ (เรียงตามความยาก)</h3>';
    data.forEach((s, i) => {
        html += `<div class="p-3 bg-white rounded-xl mb-2 shadow-sm border border-pink-50">
                    <b>${i+1}. ${s.name}</b> <span class="text-pink-400 font-normal ml-2">(ระดับ: ${s.difficulty})</span>
                 </div>`;
    });
    document.getElementById('result').innerHTML = html;
}

async function loadSchedule() {
    const res = await fetch(`${API}/schedule`);
    const data = await res.json();
    let html = '<h3 class="font-bold text-purple-600 mb-4 text-xl">📅 ตารางปฏิทิน</h3>';
    data.forEach(s => {
        html += `<div class="mb-6"><h4 class="font-bold mb-2">📘 ${s.subject}</h4><div class="grid grid-cols-3 gap-2">`;
        s.plan.forEach((p, i) => {
            html += `<div class="bg-white border border-pink-100 p-2 rounded-xl text-center text-[10px]">
                <div class="text-pink-500 font-bold">วันที่ ${i+1}</div><div>${p}</div>
            </div>`;
        });
        html += `</div></div>`;
    });
    document.getElementById('result').innerHTML = html;
}

async function deleteSubject(id) {
    if(confirm("ลบวิชานี้?")) {
        await fetch(`${API}/delete_subject/${id}`, { method: 'DELETE' });
        location.reload();
    }
}

init();
