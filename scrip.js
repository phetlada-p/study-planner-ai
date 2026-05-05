const API = ""; 

async function addSubject() {
    const name = document.getElementById('name').value;
    const deadline = document.getElementById('deadline').value;
    const assigned = document.getElementById('assigned_date').value;
    const diff = document.getElementById('difficulty').value;

    if (!name || !deadline) return alert("กรุณากรอกข้อมูลให้ครบ");

    const data = {
        name: name,
        deadline: deadline,
        assigned_date: assigned || new Date().toISOString().split('T')[0],
        difficulty: parseInt(diff) 

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
    const list = document.getElementById('list');
    if(data.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-400">ยังไม่มีข้อมูล</p>';
        return;
    }
    data.forEach(s => {
        list.innerHTML += `
        <div class="flex justify-between items-center p-4 bg-white border-l-8 border-pink-500 rounded-xl shadow-sm">
            <div><div class="font-bold">${s.name}</div><div class="text-xs text-gray-400">ส่ง: ${s.deadline}</div></div>
            <button onclick="deleteSubject(${s.id})" class="text-red-500 font-bold">ลบ</button>
        </div>`;
    });
}

async function loadPriority() {
    const res = await fetch(`${API}/prioritize`);
    const data = await res.json();
    let html = '<h3 class="font-bold text-pink-600 mb-3 underline text-xl text-center">🔥 เรียงตามลำดับความยาก</h3>';
    data.forEach((s, i) => {
        
        html += `<div class="p-3 bg-white mb-2 rounded-xl shadow-sm border border-pink-100 font-bold">
            ${i+1}. ${s.name} <span class="text-pink-500 font-normal">(ยากระดับ: ${s.difficulty})</span>
        </div>`;
    });
    document.getElementById('result').innerHTML = html;
}

async function loadSchedule() {
    const res = await fetch(`${API}/schedule`);
    const data = await res.json();
    let html = '';
    data.forEach(s => {
        html += `<div class="mb-6"><h3 class="font-bold text-xl mb-3">📘 ${s.subject}</h3><div class="grid grid-cols-3 sm:grid-cols-6 gap-2">`;
        s.plan.forEach((p, i) => {
            html += `<div class="bg-white border border-pink-100 p-2 rounded-xl text-center text-[10px] shadow-sm">
                <div class="text-pink-500 font-bold font-kanit">วันที่ ${i+1}</div><div>⏳ ${p}</div>
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
