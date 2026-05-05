const API = ""; 

async function addSubject() {
    const name = document.getElementById('name').value;
    const deadline = document.getElementById('deadline').value;
    const assigned = document.getElementById('assigned_date').value;
    
    if(!name || !deadline) return alert("กรุณากรอกข้อมูลให้ครบ");

    const data = {
        name: name,
        deadline: deadline,
        difficulty: parseInt(document.getElementById('difficulty').value),
        assigned_date: assigned || new Date().toISOString().split('T')[0]
    };

    await fetch(`${API}/subjects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    location.reload();
}

async function init() {
    const res = await fetch(`${API}/subjects`);
    const data = await res.json();
    const list = document.getElementById('list');
    
    if(data.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-400 py-4">ยังไม่มีข้อมูลในเครื่องนี้</p>';
        return;
    }

    data.forEach(s => {
        list.innerHTML += `
        <div class="flex justify-between items-center p-4 bg-white border-l-8 border-pink-500 rounded-xl shadow-sm">
            <div>
                <div class="font-bold text-lg">${s.name}</div>
                <div class="text-sm text-gray-500">(ส่ง: ${s.deadline})</div>
            </div>
            <button onclick="deleteSubject(${s.id})" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">ลบ</button>
        </div>`;
    });
}

async function deleteSubject(id) {
    if(confirm("ยืนยันการลบ?")) {
        await fetch(`${API}/delete_subject/${id}`, { method: 'DELETE' });
        location.reload();
    }
}

async function loadPriority() {
    const res = await fetch(`${API}/prioritize`);
    const data = await res.json();
    let html = '<h3 class="font-bold text-pink-600 mb-3 underline">🔥 ลำดับความสำคัญ (ในเครื่องนี้)</h3>';
    data.forEach((s, i) => {
        html += `<div class="mb-2 text-lg">${i+1}. <b>${s.name}</b> - ส่ง ${s.deadline} (ยากระดับ: ${s.difficulty})</div>`;
    });
    document.getElementById('result').innerHTML = html;
}

async function loadSchedule() {
    const res = await fetch(`${API}/schedule`);
    const data = await res.json();
    let html = '';
    
    data.forEach(s => {
        html += `<div class="mb-8">
            <h3 class="font-bold text-2xl mb-4 flex items-center gap-2">📖 ${s.subject} <span class="text-sm font-normal bg-pink-100 text-pink-600 px-3 py-1 rounded-full">ระดับ: ${s.difficulty}</span></h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">`;
        
        s.plan.forEach((p, i) => {
            html += `
            <div class="bg-white border-2 border-pink-100 p-3 rounded-2xl text-center shadow-sm">
                <div class="text-pink-500 font-bold text-sm mb-1">วันที่ ${i+1}</div>
                <div class="text-xs text-gray-600">⏳ ${p}</div>
            </div>`;
        });
        html += `</div></div>`;
    });
    document.getElementById('result').innerHTML = html;
}

init();
