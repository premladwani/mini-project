let savedName = "";
let savedEmail = "";
let savedPhone = "";
let savedRFID = "";
let currentUser = null;
let calMonth = null;
let calYear = null;
let calendarEvents = {};

const weeklyLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const weeklyData = [1,1,1,1,1,0,0];

const monthlyLabels = Array.from({length:30}, (_,i)=> String(i+1));
const monthlyData = Array.from({length:30}, (_,i)=> ((i%7===5)||(i%7===6))?0:1 );

let weeklyChartObj = null;
let monthlyChartObj = null;
let overviewChartObj = null;
let audioCtx = null;

function burstConfetti(){
    const colors = ['#f87171','#34d399','#60a5fa','#fde047','#f472b6'];
    for(let i=0;i<40;i++){
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = `${Math.random()*100}%`;
        c.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
        document.body.appendChild(c);
        setTimeout(()=> c.remove(),2200);
    }
}

function playClick(){
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type='triangle';
    o.frequency.setValueAtTime(400, audioCtx.currentTime);
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    o.start();
    o.stop(audioCtx.currentTime+0.1);
}

function updateFooterTime(){
    const footerTimeEl = document.getElementById('footerTime');
    if(footerTimeEl){
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        footerTimeEl.textContent = timeStr;
    }
}

function initParticles(){
    const canvas = document.getElementById('meshCanvas');
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.z = 400;
    const geometry = new THREE.BufferGeometry();
    const count = 1000;
    const positions = new Float32Array(count*3);
    for(let i=0;i<count*3;i++) positions[i]=(Math.random()-0.5)*1000;
    geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const material = new THREE.PointsMaterial({color:0xffffff,size:2,transparent:true,opacity:0.6});
    const points = new THREE.Points(geometry,material);
    scene.add(points);
    const cubeGeom = new THREE.BoxGeometry(100,100,100);
    const cubeMat = new THREE.MeshBasicMaterial({color:0x667eea,wireframe:true,opacity:0.4,transparent:true});
    const cube = new THREE.Mesh(cubeGeom,cubeMat);
    scene.add(cube);
    function animate(){
        requestAnimationFrame(animate);
        points.rotation.x += 0.0005;
        points.rotation.y += 0.0005;
        cube.rotation.x += 0.002;
        cube.rotation.y += 0.003;
        renderer.render(scene,camera);
    }
    window.addEventListener('resize',()=>{
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
    });
    animate();
}

function checkLoggedIn() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    return isLoggedIn === 'true';
}

function loadUserData() {
    const userData = localStorage.getItem('currentUser');
    if(!userData) {
        return false;
    }
    
    currentUser = JSON.parse(userData);
    savedName = currentUser.name;
    savedEmail = currentUser.email;
    savedPhone = currentUser.phone;
    savedRFID = currentUser.rfidNumber;
    
    return true;
}

function displayUserInfo() {
    if(!currentUser) return;
    
    const box = document.getElementById('userInfoBox');
    box.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div><strong>Name:</strong> ${savedName}</div>
            <div><strong>Email:</strong> ${savedEmail}</div>
            <div><strong>Phone:</strong> ${savedPhone}</div>
            <div><strong>RFID Number:</strong> ${savedRFID}</div>
        </div>
    `;
    
    // Update sidebar profile information
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const profileRFID = document.getElementById('profileRFID');
    
    if(profileName) profileName.textContent = savedName;
    if(profileEmail) profileEmail.textContent = savedEmail;
    if(profilePhone) profilePhone.textContent = savedPhone;
    if(profileRFID) profileRFID.textContent = savedRFID;
}

function saveUser() {
    displayUserInfo();
    updateSummary();
    document.getElementById('headerSubtitle').textContent = `Welcome, ${savedName}!`;
    burstConfetti();
    setTimeout(() => {
        if(!weeklyChartObj) createWeeklyChart();
        if(!monthlyChartObj) createMonthlyChart();
        if(!overviewChartObj) createOverviewChart();
    }, 100);
}

function loadFromStorage(){
    // Data is now loaded from login, not from stored name/rfid
    if(currentUser) {
        displayUserInfo();
        document.getElementById('headerSubtitle').textContent = `Welcome, ${savedName}!`;
        updateSummary();
    }
}

function resetDashboard(){
    savedName = '';
    savedEmail = '';
    savedPhone = '';
    savedRFID = '';
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    document.getElementById('userInfoBox').innerHTML = 'Please log in to see your information.';
    document.getElementById('resultBox').innerHTML = 'Please submit your details to view attendance summary.';
    document.getElementById('headerSubtitle').textContent = 'Welcome back!';
    if(overviewChartObj){ overviewChartObj.destroy(); overviewChartObj=null; }
    if(weeklyChartObj){ weeklyChartObj.destroy(); weeklyChartObj=null; }
    if(monthlyChartObj){ monthlyChartObj.destroy(); monthlyChartObj=null; }
    showAlert('Dashboard reset successfully','success');
}

function toggleTheme(){
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark':'light');
    applyThemeToCharts();
}

function updateSummary(){
    if(!savedName) return;
    const weeklyPresent = weeklyData.reduce((a,b)=>a+b,0);
    const monthlyPresent = monthlyData.reduce((a,b)=>a+b,0);
    const now = new Date().toLocaleString();
    const weeklyPct = ((weeklyPresent/7)*100).toFixed(0);
    const monthlyPct = ((monthlyPresent/30)*100).toFixed(0);
    const box = document.getElementById('resultBox');
    box.innerHTML = `
        <div><strong>Student:</strong> ${savedName}</div>
        <div><strong>RFID:</strong> ${savedRFID}</div>
        <div style="margin-top: 12px;"><strong>Weekly Attendance:</strong> ${weeklyPresent} present, ${7-weeklyPresent} absent (${weeklyPct}%)</div>
        <div class="progress-bar"><div class="fill" style="width:${weeklyPct}%"></div></div>
        <div style="margin-top: 12px;"><strong>Monthly Attendance:</strong> ${monthlyPresent} present, ${30-monthlyPresent} absent (${monthlyPct}%)</div>
        <div class="progress-bar"><div class="fill" style="width:${monthlyPct}%"></div></div>
        <div style="margin-top: 12px; font-size: 12px; color: #6b7280;">Updated: ${now}</div>
    `;
    if(weeklyPct < 50) showAlert('⚠️ Weekly attendance below 50%!','error');
    if(monthlyPct < 50) showAlert('⚠️ Monthly attendance below 50%!','error');
}

function createOverviewChart(){
    if(overviewChartObj) return;
    const canv = document.getElementById('overviewChart');
    if(!canv) return;
    const ctx = canv.getContext('2d');
    const total = monthlyData.length;
    const present = monthlyData.reduce((a,b)=>a+b,0);
    const absent = total - present;
    const isDark = document.body.classList.contains('dark');
    overviewChartObj = new Chart(ctx,{
        type:'doughnut',
        data:{
            labels:['Present','Absent'],
            datasets:[{
                data:[present,absent],
                backgroundColor: isDark ? ['#10b981','#ef4444'] : ['#10b981','#ef4444'],
                hoverOffset:8
            }]
        },
        options:{
            responsive: true,
            maintainAspectRatio: true,
            animation:{animateScale:true},
            plugins:{
                legend:{position:'bottom',labels:{color: isDark ? '#f3f4f6' : '#1f2937'}}
            }
        }
    });
}

function createWeeklyChart(){
    const canv = document.getElementById('weeklyChart');
    if(!canv) return;
    const ctx = canv.getContext('2d');
    const isDark = document.body.classList.contains('dark');
    const gradient = ctx.createLinearGradient(0,0,0,300);
    gradient.addColorStop(0,'rgba(102, 126, 234, 0.9)');
    gradient.addColorStop(1,'rgba(102, 126, 234, 0.3)');
    weeklyChartObj = new Chart(ctx,{
        type:'bar',
        data:{
            labels:weeklyLabels,
            datasets:[{
                label:'Present (1) / Absent (0)',
                data:weeklyData,
                backgroundColor:weeklyData.map(v=> v?'rgba(102, 126, 234, 0.9)':'rgba(239, 68, 68, 0.9)'),
                borderRadius:6,
                hoverBackgroundColor:'rgba(102, 126, 234, 1)'
            }]
        },
        options:{
            responsive: true,
            maintainAspectRatio: true,
            animation:{duration:1200,easing:'easeOutBounce'},
            plugins:{
                legend:{display:true,labels:{color: isDark ? '#f3f4f6' : '#1f2937'}},
                tooltip:{callbacks:{label(ctx){return ctx.raw? 'Present':'Absent';}}}
            },
            scales:{
                y:{beginAtZero:true,max:1.2,ticks:{stepSize:1, color: isDark ? '#f3f4f6' : '#1f2937'},grid:{color: isDark ? '#4b5563' : '#e5e7eb'}},
                x:{ticks:{color: isDark ? '#f3f4f6' : '#1f2937'},grid:{color: isDark ? '#4b5563' : '#e5e7eb'}}
            }
        }
    });
}

function createMonthlyChart(){
    const canv = document.getElementById('monthlyChart');
    if(!canv) return;
    const ctx = canv.getContext('2d');
    const isDark = document.body.classList.contains('dark');
    const grad = ctx.createLinearGradient(0,0,0,300);
    grad.addColorStop(0,'rgba(59,130,246,0.5)');
    grad.addColorStop(1,'rgba(59,130,246,0.05)');
    monthlyChartObj = new Chart(ctx,{
        type:'line',
        data:{
            labels:monthlyLabels,
            datasets:[{
                label:'Attendance',
                data:monthlyData,
                fill:true,
                backgroundColor:grad,
                borderColor:'rgba(102, 126, 234, 0.95)',
                tension:0.3,
                pointRadius:4,
                pointHoverRadius:6,
                pointBackgroundColor:'rgba(102, 126, 234, 1)'
            }]
        },
        options:{
            responsive: true,
            maintainAspectRatio: true,
            animation:{duration:1500,easing:'easeInOutQuart'},
            plugins:{
                legend:{display:true,labels:{color: isDark ? '#f3f4f6' : '#1f2937'}},
                tooltip:{callbacks:{label(ctx){return ctx.raw? 'Present':'Absent';}}}
            },
            scales:{
                y:{beginAtZero:true,max:1.2,ticks:{stepSize:1, color: isDark ? '#f3f4f6' : '#1f2937'},grid:{color: isDark ? '#4b5563' : '#e5e7eb'}},
                x:{ticks:{color: isDark ? '#f3f4f6' : '#1f2937'},grid:{color: isDark ? '#4b5563' : '#e5e7eb'}}
            }
        }
    });
}

function applyThemeToCharts(){
    const isDark = document.body.classList.contains('dark');
    if(weeklyChartObj){
        weeklyChartObj.options.scales.x.ticks.color = isDark ? '#f3f4f6' : '#1f2937';
        weeklyChartObj.options.scales.y.ticks.color = isDark ? '#f3f4f6' : '#1f2937';
        weeklyChartObj.options.plugins.legend.labels.color = isDark ? '#f3f4f6' : '#1f2937';
        weeklyChartObj.update();
    }
    if(monthlyChartObj){
        monthlyChartObj.options.scales.x.ticks.color = isDark ? '#f3f4f6' : '#1f2937';
        monthlyChartObj.options.scales.y.ticks.color = isDark ? '#f3f4f6' : '#1f2937';
        monthlyChartObj.options.plugins.legend.labels.color = isDark ? '#f3f4f6' : '#1f2937';
        monthlyChartObj.update();
    }
    if(overviewChartObj){
        overviewChartObj.options.plugins.legend.labels.color = isDark ? '#f3f4f6' : '#1f2937';
        overviewChartObj.update();
    }
}

function showAlert(msg,type='success'){
    const box = document.getElementById('alertBox');
    box.textContent = msg;
    box.className = type;
    box.style.display = 'block';
    setTimeout(()=> box.style.display='none',3500);
}

function loadCalendarEvents(){
    try{
        calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')||'{}');
    }catch(e){ calendarEvents = {}; }
}

function saveCalendarEvents(){
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
}

function monthName(m){
    return ['January','February','March','April','May','June','July','August','September','October','November','December'][m];
}

function showCalendar(month, year){
    calMonth = month;
    calYear = year;
    const cal = document.getElementById('calendar');
    const header = document.getElementById('monthYear');
    if(!cal || !header) return;
    header.textContent = `${monthName(month)} ${year}`;
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();
    const first = new Date(year,month,1).getDay();
    const days = new Date(year,month+1,0).getDate();
    let html='<table><tr>';
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=> html+=`<th>${d}</th>`);
    html+='</tr><tr>';
    for(let i=0;i<first;i++) html+='<td></td>';
    for(let d=1;d<=days;d++){
        const key = `${year}-${month}-${d}`;
        const hasEvent = !!calendarEvents[key];
        const isToday = d===todayDay && month===todayMonth && year===todayYear;
        const dt = new Date(year,month,d);
        const weekend = dt.getDay()===0 || dt.getDay()===6;
        let cls = '';
        if(isToday) cls+=' today';
        if(hasEvent) cls+=' event';
        if(weekend) cls+=' weekend';
        html+=`<td class="${cls.trim()}" data-day="${d}">${d}</td>`;
        if((first+d)%7===0) html+='</tr><tr>';
    }
    html+='</tr></table>';
    cal.innerHTML = html;
    cal.querySelectorAll('td').forEach(td=>{
        td.addEventListener('click',()=>{
            const txt = td.getAttribute('data-day');
            if(!txt) return;
            cal.querySelectorAll('td').forEach(x=>x.classList.remove('selected'));
            td.classList.add('selected');
            const day = parseInt(txt,10);
            const key = `${calYear}-${calMonth}-${day}`;
            const existing = calendarEvents[key] || '';
            const note = prompt(`Note for ${day} ${monthName(calMonth)} ${calYear}:`, existing);
            if(note!==null){
                if(note.trim()){
                    calendarEvents[key]=note.trim();
                } else {
                    delete calendarEvents[key];
                }
                saveCalendarEvents();
                showCalendar(calMonth, calYear);
                showAlert(`Date ${day} saved`,'success');
            }
        });
    });
}

function initCalendarControls(){
    const prev = document.getElementById('prevMonth');
    const next = document.getElementById('nextMonth');
    if(prev) prev.addEventListener('click',()=>{
        let m = calMonth -1;
        let y = calYear;
        if(m<0){ m=11; y--; }
        showCalendar(m,y);
    });
    if(next) next.addEventListener('click',()=>{
        let m = calMonth +1;
        let y = calYear;
        if(m>11){ m=0; y++; }
        showCalendar(m,y);
    });
}

function autoSaveNotes(){
    const text = document.getElementById('notes').value;
    localStorage.setItem('dashboardNotes', text);
}

function saveNotes(){
    const text = document.getElementById('notes').value;
    localStorage.setItem('dashboardNotes', text);
    showAlert('Notes saved','success');
}

function loadNotes(){
    const t = localStorage.getItem('dashboardNotes')||'';
    const area = document.getElementById('notes');
    if(area) area.value = t;
}

function navigateSection(sectionId) {
    // All sections are now visible, so no navigation needed
}

document.addEventListener('DOMContentLoaded',()=>{
    // Load user data from login (if available)
    loadUserData();

    // Initialize theme
    if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');

    // Display user information if available
    loadFromStorage();
    loadCalendarEvents();
    loadNotes();

    // Initialize calendar
    const now = new Date();
    showCalendar(now.getMonth(), now.getFullYear());
    initCalendarControls();

    // Update footer time
    updateFooterTime();
    setInterval(updateFooterTime, 1000);

    document.getElementById('resetBtn').addEventListener('click', () => {
        resetDashboard();
    });

    document.getElementById('themeToggle').addEventListener('click', () => {
        toggleTheme();
    });

    // Save notes button
    document.querySelector('.save-notes-btn').addEventListener('click', saveNotes);

    // Auto-save notes every 5 seconds (silently)
    setInterval(autoSaveNotes, 5000);

    // Initialize particles
    initParticles();
    
    // Initialize all charts on load
    setTimeout(() => {
        if(!weeklyChartObj) createWeeklyChart();
        if(!monthlyChartObj) createMonthlyChart();
        if(!overviewChartObj) createOverviewChart();
    }, 100);
});
