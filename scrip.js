const API = ""; // ปล่อยว่างไว้เมื่อใช้บน Render

// เพิ่มวิชา
async function addSubject() {
    const name = document.getElementById('name').value;
    const deadline = document.getElementById('deadline').value;
    const assigned = document.getElementById('assigned_date').value;
    const difficulty = document.getElementById('difficulty').value;

    if (!name || !deadline) {
        alert("กรุณากรอกข้อมูลให้ครบครับ");
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

    if (res.ok) {
        location.reload();
    }
}

// แสดงรายการวิชา
async function init() {
    try {
        const res = await fetch(`${API}/subjects`);
        const data = await res.json();
        const list = document.getElementById('list');
        list.innerHTML = "";
        
        if (data.length === 0) {
            list.innerHTML = `<p class="text-center text-gray-400 py-4 text-sm">ยังไม่มีวิชาในรายการ</p>`;
        }

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
    } catch (e) {
        console.error("Error loading subjects:", e);
    }
}

// เรียงลำดับความสำคัญ
async function loadPriority() {
    const res = await fetch(`${API}/prioritize`);
    const data = await res.json();
    let html = "<b>🔥 เรียงตามวันส่ง (ใกล้สุดขึ้นก่อน):</b><br><br>";
    data.forEach((s, i) => {
        html += `${i+1}. <strong>${s.name}</strong> - <small>${s.deadline}</small><br>`;
    });
    document.getElementById('result').innerHTML = html;
}

// ลบวิชา
async function deleteSubject(id) {
    if (confirm("ต้องการลบวิชานี้ใช่หรือไม่?")) {
        await fetch(`${API}/delete_subject/${id}`, { method: 'DELETE' });
        location.reload();
    }
}

init();
