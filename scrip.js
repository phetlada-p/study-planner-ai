const API = ""; // ปล่อยว่างไว้ถ้าไฟล์อยู่บน Render เดียวกัน

async function addSubject() {
    const data = {
        name: document.getElementById('name').value,
        deadline: document.getElementById('deadline').value,
        difficulty: parseInt(document.getElementById('difficulty').value),
        assigned_date: new Date().toISOString().split('T')[0]
    };
    await fetch(`${API}/subjects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    location.reload();
}

async function loadPriority() {
    const res = await fetch(`${API}/prioritize`);
    const data = await res.json();
    let html = '<h2 class="font-bold mb-2">🔥 ลำดับความด่วน:</h2>';
    data.forEach((s, i) => {
        html += `<p>${i+1}. <b>${s.name}</b> - ยาก: ${s.difficulty} (ส่ง: ${s.deadline})</p>`;
    });
    document.getElementById('result').innerHTML = html;
}

async function loadSchedule() {
    const res = await fetch(`${API}/schedule`);
    const data = await res.json();
    let html = '<h2 class="font-bold mb-2">📅 แผนการเรียน:</h2>';
    data.forEach(s => {
        html += `<div class="mb-4"><b>${s.subject}</b> (${s.difficulty})<br><small>${s.plan[0]}</small></div>`;
    });
    document.getElementById('result').innerHTML = html;
}

// โหลดรายการวิชาตอนเปิดหน้าเว็บ
async function init() {
    const res = await fetch(`${API}/subjects`);
    const data = await res.json();
    const list = document.getElementById('list');
    data.forEach(s => {
        list.innerHTML += `<div class="flex justify-between border-b py-2">
            <span>${s.name} (ส่ง: ${s.deadline})</span>
            <button onclick="deleteSubject(${s.id})" class="text-red-500 text-sm">ลบ</button>
        </div>`;
    });
}

async function deleteSubject(id) {
    await fetch(`${API}/delete_subject/${id}`, { method: 'DELETE' });
    location.reload();
}

init();
