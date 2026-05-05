let userID = localStorage.getItem('study_planner_uid') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('study_planner_uid', userID);

const API = ""; // ** สำคัญ: ใส่ URL API ของคุณที่นี่ **

function toggleDayStyle(el) {
    if(el.checked) {
        el.parentElement.classList.add('bg-pink-400', 'text-white');
    } else {
        el.parentElement.classList.remove('bg-pink-400', 'text-white');
    }
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

    try {
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
    } catch (error) {
        console.error("Error adding subject:", error);
        alert("บันทึกไม่สำเร็จ ตรวจสอบการเชื่อมต่อ API นะคะ");
    }
}

async function init(mode = 'normal') {
    try {
        const res = await fetch(`${API}/subjects?user_id=${userID}`);
        const data = await res.json();
        const list = document.getElementById('list');
        
        list.innerHTML = `<h3 class="font-bold text-gray-500 mb-4 italic text-center">📖 รายการวิชาที่บันทึกไว้</h3>`;
        
        if (data.length === 0) {
            list.innerHTML += `<p class="text-center text-gray-400 text-sm">ยังไม่มีรายการวิชาค่ะ</p>`;
        }

        if (mode === 'priority') {
            data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        }

        let subjectsHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
        data.forEach(s => {
            const diffStars = ["⭐ ง่าย", "⭐⭐ ปานกลาง", "⭐⭐⭐ ยาก"][s.difficulty - 1];
            subjectsHTML += `
            <div class="flex justify-between items-center p-5 bg-white rounded-2xl shadow-sm border border-pink-50 hover:border-pink-200 transition-all">
                <div>
                    <div class="font-bold text-gray-700 text-lg">${s.name} <span class="text-xs font-normal text-gray-400">${diffStars}</span></div>
                    <div class="text-sm text-pink-400 font-medium">กำหนดส่ง: ${s.deadline}</div>
                </div>
                <button onclick="deleteSubject(${s.id})" class="text-red-300 hover:text-red-500 font-bold transition-colors">ลบ</button>
            </div>`;
        });
        subjectsHTML += `</div>`;
        list.innerHTML += subjectsHTML;

        if (mode === 'priority') {
            document.getElementById('result').innerHTML = `
                <div class="text-center py-10 animate-fade-in">
                    <h3 class="text-4xl font-bold text-[#ff85b3] mb-4 italic flex items-center justify-center gap-3">🔥 จัดลำดับสำเร็จ!</h3>
                    <div class="text-7xl mb-6">🎯</div>
                    <p class="text-gray-500 text-lg mb-8">วิชาด่วนที่สุดถูกเลื่อนขึ้นมาให้เรียบร้อยแล้วค่ะ</p>
                    <div class="text-left max-w-2xl mx-auto space-y-3 bg-white p-8 rounded-[3rem] shadow-inner border border-pink-50">
                        <h4 class="font-bold text-gray-600 mb-4 border-b pb-2 flex items-center gap-2">📋 ลำดับความสำคัญของคุณ:</h4>
                        ${subjectsHTML.replace(/<button.*?button>/g, '')}
                    </div>
                </div>`;
            document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error("Error fetching subjects:", error);
    }
}

async function loadSchedule() {
    try {
        const res = await fetch(`${API}/schedule?user_id=${userID}`);
        const data = await res.json();
        
        const savedDayOffs = JSON.parse(localStorage.getItem(`dayoffs_${userID}`)) || [];

        let html = `
            <div class="text-center mb-10">
                <h3 class="text-3xl font-bold text-[#7c66e3] flex items-center justify-center gap-3 italic">
                    📅 ตารางอ่านหนังสือของคุณ
                </h3>
                <p class="text-gray-400 text-sm mt-2 font-medium">คำนวณตามเป้าหมายชั่วโมงเรียนและวันหยุดที่คุณเลือก</p>
            </div>`;
        
        if (data.length === 0) {
            document.getElementById('result').innerHTML = html + `
                <div class="text-center py-20">
                    <div class="text-5xl mb-4">📭</div>
                    <p class='italic text-gray-400'>ยังไม่มีข้อมูลวิชาเพื่อสร้างตารางค่ะ</p>
                </div>`;
            return;
        }

        data.forEach(s => {
            let effectiveDays = 0;
            let checkDate = new Date();
            checkDate.setHours(0,0,0,0);

            for(let i = 0; i < s.day_count; i++) {
                if (!savedDayOffs.includes(checkDate.getDay())) {
                    effectiveDays++;
                }
                checkDate.setDate(checkDate.getDate() + 1);
            }

            const totalHoursNeeded = s.difficulty === 3 ? 60 : (s.difficulty === 2 ? 30 : 10);
            
            const hrsPerDay = effectiveDays > 0 ? totalHoursNeeded / effectiveDays : 0;
            
            const finalHrs = Math.floor(hrsPerDay);
            const finalMins = Math.round((hrsPerDay - finalHrs) * 60);
            const timeDisplay = finalHrs > 0 ? `${finalHrs} ชม. ${finalMins} นาที` : `${finalMins} นาที`;

            html += `
            <div class="mb-12 bg-white p-8 rounded-[3.5rem] shadow-sm border border-pink-50/50 hover:shadow-md transition-shadow">
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-10 bg-[#7c66e3] rounded-full"></div>
                        <h4 class="font-bold text-2xl text-gray-700">● ${s.subject}</h4>
                    </div>
                    <div class="bg-pink-50 px-5 py-2 rounded-2xl text-pink-500 text-sm font-bold border border-pink-100">
                        เรียนจริง ${effectiveDays} วัน (หยุด ${savedDayOffs.length} วัน/สัปดาห์)
                    </div>
                </div>
                
                <div class="calendar-grid">`;

            let displayDate = new Date();
            displayDate.setHours(0,0,0,0);

            for(let i = 1; i <= s.day_count; i++) {
                const isOff = savedDayOffs.includes(displayDate.getDay());
                
                html += `
                <div class="${isOff ? 'bg-gray-50/50 opacity-40' : 'bg-[#fcfaff] border-indigo-50'} p-5 rounded-[2rem] text-center border transition-all hover:scale-105 group">
                    <div class="text-[10px] ${isOff ? 'text-gray-400' : 'text-[#7c66e3]'} font-bold uppercase mb-2 tracking-widest">Day ${i}</div>
                    <div class="text-[13px] font-extrabold ${isOff ? 'text-gray-400' : 'text-gray-700'}">
                        ${isOff ? '<span class="text-xl">🏖️</span><br>พักผ่อน' : '<span class="text-pink-400">⌛</span> ' + timeDisplay}
                    </div>
                </div>`;
                displayDate.setDate(displayDate.getDate() + 1);
            }
            html += `</div></div>`;
        });
        
        document.getElementById('result').innerHTML = html;
        document.getElementById('result').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error("Error loading schedule:", error);
        alert("ไม่สามารถโหลดตารางได้ ตรวจสอบ API นะคะ");
    }
}

async function deleteSubject(id) {
    if(confirm("ต้องการลบวิชานี้ใช่ไหมคะ?")) {
        try {
            await fetch(`${API}/delete_subject/${id}?user_id=${userID}`, { method: 'DELETE' });
            location.reload();
        } catch (error) {
            alert("ลบไม่สำเร็จค่ะ");
        }
    }
}

init();
