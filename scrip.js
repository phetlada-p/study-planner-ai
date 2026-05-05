let userID = localStorage.getItem('study_planner_uid');
if (!userID) {
    userID = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('study_planner_uid', userID);
}

const API = ""; 

async function addSubject() {
    const name = document.getElementById('name').value;
    const deadline = document.getElementById('deadline').value;
    const assigned = document.getElementById('assigned_date').value;
    const difficulty = document.getElementById('difficulty').value;

    if (!name || !deadline) return alert("กรุณากรอกข้อมูลให้ครบค่ะ");

    await fetch(`${API}/subjects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            user_id: userID, // ส่ง ID ไปด้วย
            name: name,
            deadline: deadline,
            assigned_date: assigned,
            difficulty: parseInt(difficulty)
        })
    });
    location.reload();
}

async function init() {
    const res = await fetch(`${API}/subjects?user_id=${userID}`); // ดึงตาม ID
    const data = await res.json();
    const list = document.getElementById('list');
    list.innerHTML = `<h3 class="font-bold text-gray-500 mb-2 italic">📖 วิชาของคุณ</h3>`;
    data.forEach(s => {
        list.innerHTML += `
        <div class="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-pink-50">
            <div><div class="font-bold text-gray-700">${s.name}</div><div class="text-[10px] text-gray-400">ส่ง: ${s.deadline}</div></div>
            <button onclick="deleteSubject(${s.id})" class="text-red-300 hover:text-red-500 font-bold">ลบ</button>
        </div>`;
    });
}

async function loadSchedule() {
    const res = await fetch(`${API}/schedule?user_id=${userID}`);
    const data = await res.json();
    let html = "<h3 class='text-2xl font-bold text-[#7c66e3] mb-8 italic border-b pb-4 text-center'>✨ ตารางแผนการอ่านหนังสือรายวัน ✨</h3>";
    
    if (data.length === 0) {
        document.getElementById('result').innerHTML = "<p class='text-center text-gray-400 mt-20'>ยังไม่มีวิชาในตารางของคุณค่ะ</p>";
        return;
    }

    data.forEach((s) => {
        html += `
        <div class="mb-10 bg-gray-50 p-6 rounded-[2rem] border border-white shadow-sm">
            <div class="flex items-center mb-5">
                <div class="w-3 h-3 bg-[#7c66e3] rounded-full mr-3"></div>
                <h4 class="font-bold text-xl text-gray-700">${s.subject}</h4>
            </div>
            <div class="calendar-grid">`;
        
        for(let i = 1; i <= s.day_count; i++) {
            html += `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-pink-50 text-center hover:scale-105 transition-all">
                <div class="text-[10px] text-pink-400 font-bold mb-1 uppercase">Day ${i}</div>
                <div class="text-sm font-bold text-gray-600">⏳ ${s.min_per_day}</div>
                <div class="text-[9px] text-gray-400">นาที</div>
            </div>`;
        }
        html += `</div></div>`;
    });
    
    document.getElementById('result').innerHTML = html;
}

async function deleteSubject(id) {
    if(confirm("ลบวิชานี้ใช่ไหมคะ?")) {
        await fetch(`${API}/delete_subject/${id}?user_id=${userID}`, { method: 'DELETE' });
        location.reload();
    }
}

init();
