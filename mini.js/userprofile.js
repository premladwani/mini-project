let attendance=[

{date:"2026-03-01",in:"09:00",out:"17:00",status:"Present"},
{date:"2026-03-02",in:"09:30",out:"17:00",status:"Late"},
{date:"2026-03-03",in:"-",out:"-",status:"Absent"},
{date:"2026-03-04",in:"09:05",out:"17:10",status:"Present"}

];

let notifications=[

"System update completed",
"RFID device synced successfully",
"Late entry warning on March 2"

];

function loadSummary(){

let present=attendance.filter(a=>a.status==="Present").length;
let absent=attendance.filter(a=>a.status==="Absent").length;
let late=attendance.filter(a=>a.status==="Late").length;

let percent=Math.round((present/attendance.length)*100);

document.getElementById("presentCount").innerText=present;
document.getElementById("absentCount").innerText=absent;
document.getElementById("lateCount").innerText=late;
document.getElementById("percentage").innerText=percent+"%";

}

function loadHistory(){

let table=document.getElementById("historyTable");

table.innerHTML="";

attendance.forEach(a=>{

table.innerHTML+=`

<tr>
<td>${a.date}</td>
<td>${a.in}</td>
<td>${a.out}</td>
<td>${a.status}</td>
</tr>

`;

});

}

function loadNotifications(){

let list=document.getElementById("notificationList");

notifications.forEach(n=>{

list.innerHTML+=`<li>${n}</li>`;

});

}

function filterHistory(){

let date=document.getElementById("searchDate").value;

let filtered=attendance.filter(a=>a.date===date);

let table=document.getElementById("historyTable");

table.innerHTML="";

filtered.forEach(a=>{

table.innerHTML+=`

<tr>
<td>${a.date}</td>
<td>${a.in}</td>
<td>${a.out}</td>
<td>${a.status}</td>
</tr>

`;

});

}

function updateProfile(){

alert("Profile updated successfully");

}

function changePassword(){

alert("Password changed successfully");

}

function sendSupport(){

let msg=document.getElementById("supportMessage").value;

if(msg===""){

alert("Please enter your issue");

return;

}

alert("Support request sent");

}

function logout(){

alert("Logging out");

window.location.href="login.html";

}

function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('themeBtn');
    
    if (body.classList.contains('dark')) {
        body.classList.remove('dark');
        themeBtn.textContent = ' Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark');
        themeBtn.textContent = ' Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('themeBtn');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        if (themeBtn) themeBtn.textContent = ' Light Mode';
    } else {
        if (themeBtn) themeBtn.textContent = ' Dark Mode';
    }
});

loadSummary();
loadHistory();
loadNotifications();