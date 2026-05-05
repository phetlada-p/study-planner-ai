let userID = localStorage.getItem('study_planner_uid') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('study_planner_uid', userID);

const API = ""; 

async function addSubject() {
    const name = document.getElementById('name').value;
    const deadline = document.getElementById('deadline').value;
    const assigned = document.getElementById('assigned_date').value;
    const difficulty = document.getElementById('difficulty').value;

    if (!name || !deadline) return alert("กรอกข้อมูลให้ครบก่อนนะคะ");

    await fetch(`${API}/subjects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: userID, name, deadline, assigned_date: assigned, difficulty: parseInt(difficulty) })
    });
    location.reload();
}

async function init(mode = 'normal') {
    const res = await fetch(`${API}/subjects?user_id=${userID}`);
    const data = await res.json();
    const list = document.getElementById('list');
    list.innerHTML = `<h3 class="font-bold text-gray-500 mb-2 italic">📖 รายการวิชา</h3>`;
    
    let subjectsHTML = "";
    data.forEach(s => {
        const diffStars = ["⭐ ง่าย", "⭐⭐ ปานกลาง", "⭐⭐⭐ ยาก"][s.difficulty - 1];
        subjectsHTML += `
        <div class="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-pink-50 mb-2">
            <div>
                <div class="font-bold text-gray-700">${s.name} <span class="text-[10px] font-normal text-gray-400">${diffStars}</span></div>
                <div class="text-[10px] text-pink-400">ส่ง: ${s.deadline}</div>
            </div>
            <button onclick="deleteSubject(${s.id})" class="text-red-300 hover:text-red-500 font-bold text-sm">ลบ</button>
        </div>`;
    });
    list.innerHTML += subjectsHTML;

    if (mode === 'priority') {
        document.getElementById('result').innerHTML = `
            <div class="text-center py-10">
                <h3 class="text-3xl font-bold text-[#ff85b3] mb-3 italic">🔥 จัดลำดับสำเร็จ!</h3>
                <p class="text-gray-500 mb-6">วิชาด่วนที่สุดถูกเลื่อนขึ้นมาให้แล้วค่ะ</p>
                <div class="text-5xl mb-10">🎯</div>
                <div class="text-left max-w-md mx-auto space-y-3">
                    <h4 class="font-bold text-gray-600 mb-4 border-b pb-2">📋 ลำดับความสำคัญ:</h4>
                    ${subjectsHTML.replace(/<button.*?button>/g, '')}
                </div>
            </div>`;
    }
}

async function loadSchedule() {
    const res = await fetch(`${API}/schedule?user_id=${userID}`);
    const data = await res.json();
    let html = "<h3 class='text-2xl font-bold text-[#7c66e3] mb-8 text-center'>📅 ตารางอ่านหนังสือ</h3>";
    
    if (data.length === 0) return document.getElementById('result').innerHTML = html + "<p class='text-center mt-20 italic text-gray-400'>ยังไม่มีวิชาค่ะ</p>";

    data.forEach(s => {
        html += `
        <div class="mb-10 bg-[#f8f7ff] p-6 rounded-[2.5rem] border border-white">
            <h4 class="font-bold text-xl text-gray-700 mb-5 ml-2">● ${s.subject}</h4>
            <div class="calendar-grid">`;
        for(let i = 1; i <= s.day_count; i++) {
            let timeStr = s.hours > 0 ? `${s.hours} ชม. ${s.mins} นาที` : `${s.mins} นาที`;
            html += `
            <div class="bg-white p-3 rounded-2xl shadow-sm border border-pink-50 text-center hover:scale-110 transition-all">
                <div class="text-[9px] text-pink-400 font-bold uppercase mb-1">Day ${i}</div>
                <div class="text-[11px] font-bold text-gray-600">⏳ ${timeStr}</div>
            </div>`;
        }
        html += `</div></div>`;
    });
    document.getElementById('result').innerHTML = html;
}

async function deleteSubject(id) {
    if(confirm("ลบวิชานี้?")) {
        await fetch(`${API}/delete_subject/${id}?user_id=${userID}`, { method: 'DELETE' });
        location.reload();
    }
}

init();
