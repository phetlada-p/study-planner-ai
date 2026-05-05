let userID = localStorage.getItem('study_planner_uid') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('study_planner_uid', userID);

const API = ""; // URL ของ API (ถ้ามี)

function toggleColor(el) {
    el.parentElement.classList.toggle('bg-pink-400', el.checked);
    el.parentElement.classList.toggle('text-white', el.checked);
}

async function addSubject() {
    const name = document.getElementById('name').value;
    const deadline = document.getElementById('deadline').value;
    const assigned = document.getElementById('assigned_date').value;
    const difficulty = document.getElementById('difficulty').value;
    
    const dayOffs = Array.from(document.querySelectorAll('.day-off-input:checked'))
                         .map(cb => parseInt(cb.value));

    if (!name || !deadline) return alert("กรอกข้อมูลให้ครบก่อนนะคะ");
    
    localStorage.setItem(`dayoffs_${userID}`, JSON.stringify(dayOffs));

    await fetch(`${API}/subjects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            user_id: userID, 
            name, 
            deadline, 
            assigned_date: assigned, 
            difficulty: parseInt(difficulty), 
            day_offs: dayOffs 
        })
    });
    location.reload();
}

async function loadSchedule() {
    const res = await fetch(`${API}/schedule?user_id=${userID}`);
    const data = await res.json();
    const savedDayOffs = JSON.parse(localStorage.getItem(`dayoffs_${userID}`)) || [];

    let html = `<h3 class="text-3xl font-bold text-[#7c66e3] text-center mb-10 italic">📅 ตารางอ่านหนังสือ</h3>`;

    data.forEach(s => {
        let calcDate = new Date(); 
        calcDate.setHours(0,0,0,0);
        
        let effectiveDays = 0;
        for(let i = 0; i < s.day_count; i++) {
            if (!savedDayOffs.includes(calcDate.getDay())) {
                effectiveDays++;
            }
            calcDate.setDate(calcDate.getDate() + 1);
        }

        const totalHrs = s.difficulty === 3 ? 60 : (s.difficulty === 2 ? 30 : 10);
        const hrsPerDay = effectiveDays > 0 ? totalHrs / effectiveDays : totalHrs / s.day_count;
        const h = Math.floor(hrsPerDay);
        const m = Math.round((hrsPerDay - h) * 60);
        const timeStr = h > 0 ? `${h} ชม. ${m} นาที` : `${m} นาที`;

        html += `
        <div class="mb-10 p-8 bg-[#f8f9ff] rounded-[3rem] border border-white shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h4 class="text-2xl font-bold text-gray-700 ml-4">● ${s.subject}</h4>
                <span class="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold italic">เรียนจริง ${effectiveDays} วัน</span>
            </div>
            <div class="calendar-grid">`;

        let cardDate = new Date();
        cardDate.setHours(0,0,0,0);

        for(let i = 1; i <= s.day_count; i++) {
            const isOff = savedDayOffs.includes(cardDate.getDay());
            
            html += `
            <div class="${isOff ? 'bg-gray-100 opacity-40 shadow-none' : 'bg-white shadow-sm'} p-5 rounded-[2rem] text-center border border-pink-50 transition-all hover:scale-105">
                <div class="text-[9px] ${isOff ? 'text-gray-400' : 'text-pink-400'} font-bold mb-2 tracking-widest uppercase">DAY ${i}</div>
                <div class="text-[13px] font-bold ${isOff ? 'text-gray-400' : 'text-gray-700'}">
                    ${isOff ? '<span class="text-lg">🏖️</span><br>พักผ่อน' : '⏳ ' + timeStr}
                </div>
            </div>`;
            
            cardDate.setDate(cardDate.getDate() + 1);
        }
        html += `</div></div>`;
    });
    
    document.getElementById('result').innerHTML = html;
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

async function init(mode = 'normal') {
    const res = await fetch(`${API}/subjects?user_id=${userID}`);
    let data = await res.json();
    const list = document.getElementById('list');
    
    if (mode === 'priority') {
        data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    let html = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">`;
    data.forEach(s => {
        html += `
        <div class="p-5 bg-white rounded-3xl border border-pink-100 shadow-sm flex justify-between items-center transition-all">
            <div>
                <b class="text-gray-700 text-lg">${s.name}</b><br>
                <small class="text-pink-400 font-bold">🎯 ส่ง: ${s.deadline}</small>
            </div>
            <button onclick="deleteSubject(${s.id})" class="text-red-200 hover:text-red-500 font-bold">ลบ</button>
        </div>`;
    });
    list.innerHTML = html + `</div>`;
    
    if (mode === 'priority') {
        document.getElementById('result').innerHTML = `
            <div class="text-center py-10 fade-in">
                <div class="text-6xl mb-4">🏆</div>
                <h3 class="text-2xl font-bold text-pink-500 italic">จัดลำดับความสำคัญสำเร็จ!</h3>
                <p class="text-gray-400">งานที่ต้องรีบส่งที่สุดถูกเลื่อนขึ้นมาไว้ลำดับแรกแล้วค่ะ</p>
            </div>`;
    }
}

async function deleteSubject(id) {
    if(confirm("ต้องการลบวิชานี้ใช่ไหมคะ?")) {
        await fetch(`${API}/delete_subject/${id}?user_id=${userID}`, { method: 'DELETE' });
        location.reload();
    }
}

init();
