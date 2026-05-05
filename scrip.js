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

    if (!name || !deadline) return alert("กรุณากรอกชื่อวิชาและวันส่งให้ครบถ้วนนะคะ");

    try {
        await fetch(`${API}/subjects`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: userID,
                name: name,
                deadline: deadline,
                assigned_date: assigned,
                difficulty: parseInt(difficulty)
            })
        });
        location.reload();
    } catch (e) { alert("บันทึกไม่สำเร็จ ลองใหม่อีกครั้งนะคะ"); }
}

async function init(mode = 'normal') {
    try {
        const res = await fetch(`${API}/subjects?user_id=${userID}`);
        const data = await res.json();
        const list = document.getElementById('list');
        
        list.innerHTML = `<h3 class="font-bold text-gray-500 mb-2 italic text-sm">📖 รายการวิชา (ส่งด่วนขึ้นก่อน)</h3>`;
        
        data.forEach(s => {
            list.innerHTML += `
            <div class="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-pink-50 mb-2">
                <div>
                    <div class="font-bold text-gray-700">${s.name}</div>
                    <div class="text-[10px] text-pink-400">กำหนดส่ง: ${s.deadline}</div>
                </div>
                <button onclick="deleteSubject(${s.id})" class="text-red-300 hover:text-red-500 font-bold text-sm transition-colors">ลบ</button>
            </div>`;
        });

        if (mode === 'priority') {
            document.getElementById('result').innerHTML = `
                <div class="text-center py-20 animate-pulse">
                    <h3 class="text-3xl font-bold text-[#ff85b3] mb-4 italic">🔥 จัดลำดับงานสำเร็จ!</h3>
                    <p class="text-gray-500">วิชาที่ต้องส่งเร็วที่สุดถูกเลื่อนขึ้นมาให้แล้วทางซ้ายมือค่ะ</p>
                    <div class="mt-8 text-5xl">🎯</div>
                </div>
            `;
        }
    } catch (e) { console.error(e); }
}

async function loadSchedule() {
    try {
        const res = await fetch(`${API}/schedule?user_id=${userID}`);
        const data = await res.json();
        let html = "<h3 class='text-2xl font-bold text-[#7c66e3] mb-8 italic border-b pb-4 text-center'>📅 ตารางอ่านหนังสือรายวันของคุณ</h3>";
        
        if (data.length === 0) {
            document.getElementById('result').innerHTML = html + "<p class='text-center text-gray-400 mt-20 italic'>ยังไม่มีข้อมูลวิชาเพื่อจัดตารางค่ะ</p>";
            return;
        }

        data.forEach((s) => {
            html += `
            <div class="mb-10 bg-[#f8f7ff] p-6 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center mb-5 ml-2">
                    <div class="w-3 h-3 bg-[#7c66e3] rounded-full mr-3 shadow-md"></div>
                    <h4 class="font-bold text-xl text-gray-700">${s.subject}</h4>
                </div>
                <div class="calendar-grid">`;
            
            for(let i = 1; i <= s.day_count; i++) {
                let timeStr = "";
                if(s.hours > 0) timeStr += `${s.hours} ชม. `;
                timeStr += `${s.mins} นาที`;

                html += `
                <div class="bg-white p-3 rounded-2xl shadow-sm border border-pink-50 text-center hover:scale-110 transition-all cursor-default">
                    <div class="text-[9px] text-pink-400 font-bold mb-1 uppercase tracking-widest">Day ${i}</div>
                    <div class="text-[11px] font-bold text-gray-600">⏳ ${timeStr}</div>
                </div>`;
            }
            html += `</div></div>`;
        });
        
        document.getElementById('result').innerHTML = html;
    } catch (e) { alert("เกิดข้อผิดพลาดในการโหลดตารางค่ะ"); }
}

async function deleteSubject(id) {
    if(confirm("ยืนยันการลบวิชานี้ใช่ไหมคะ?")) {
        await fetch(`${API}/delete_subject/${id}?user_id=${userID}`, { method: 'DELETE' });
        location.reload();
    }
}

init();
