/* THEME TOGGLE */
function toggleTheme(){
const body = document.body;
const themeBtn = document.getElementById("themeBtn");
    
if(body.classList.contains("dark-theme")){
body.classList.remove("dark-theme");
body.classList.add("light-theme");
themeBtn.textContent = "☀ Light Mode";
themeBtn.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
}else{
body.classList.remove("light-theme");
body.classList.add("dark-theme");
themeBtn.textContent = "🌙 Dark Mode";
themeBtn.style.background = "linear-gradient(135deg, #2a2a3e, #1a1a2e)";
}
}

function saveSettings(){

const settings={

allowRegistration:document.getElementById("allowRegistration").checked,
defaultRole:document.getElementById("defaultRole").value,

roleAccess:document.getElementById("roleAccess").checked,
maxAdmins:document.getElementById("maxAdmins").value,

passwordLength:document.getElementById("passwordLength").value,
requireSpecial:document.getElementById("requireSpecial").checked,
failedAttempts:document.getElementById("failedAttempts").value,

permRead:document.getElementById("permRead").checked,
permWrite:document.getElementById("permWrite").checked,
permDelete:document.getElementById("permDelete").checked,
permApprove:document.getElementById("permApprove").checked,

multiDepartment:document.getElementById("multiDepartment").checked,
departmentRequired:document.getElementById("departmentRequired").checked,

defaultStatus:document.getElementById("defaultStatus").value

}

localStorage.setItem("systemSettings",JSON.stringify(settings))

// Show popup modal instead of inline message
document.getElementById("successModal").style.display="block"

setTimeout(closeSuccessModal, 3000)

}

function closeSuccessModal(){
document.getElementById("successModal").style.display="none"
}

function loadSettings(){

const settings=JSON.parse(localStorage.getItem("systemSettings"))

if(!settings) return

document.getElementById("allowRegistration").checked=settings.allowRegistration
document.getElementById("defaultRole").value=settings.defaultRole

document.getElementById("roleAccess").checked=settings.roleAccess
document.getElementById("maxAdmins").value=settings.maxAdmins

document.getElementById("passwordLength").value=settings.passwordLength
document.getElementById("requireSpecial").checked=settings.requireSpecial
document.getElementById("failedAttempts").value=settings.failedAttempts

document.getElementById("permRead").checked=settings.permRead
document.getElementById("permWrite").checked=settings.permWrite
document.getElementById("permDelete").checked=settings.permDelete
document.getElementById("permApprove").checked=settings.permApprove

document.getElementById("multiDepartment").checked=settings.multiDepartment
document.getElementById("departmentRequired").checked=settings.departmentRequired

document.getElementById("defaultStatus").value=settings.defaultStatus

}

function resetSettings(){
// Show confirmation modal
document.getElementById("resetModal").style.display="block"
}

function openResetModal(){
document.getElementById("resetModal").style.display="block"
}

function closeResetModal(){
document.getElementById("resetModal").style.display="none"
}

function confirmReset(){
// Clear localStorage
localStorage.removeItem("systemSettings")
    
// Reset all form fields
document.querySelectorAll("input").forEach(input=>{
if(input.type==="checkbox"){
input.checked=false
// Reset checked state for default checked items
if(input.id==="permRead" || input.id==="departmentRequired"){
input.checked=true
}
}else{
input.value=""
// Reset default values
if(input.id==="passwordLength"){
input.value="8"
}
if(input.id==="maxAdmins"){
input.value="5"
}
if(input.id==="failedAttempts"){
input.value="3"
}
}
})
    
document.querySelectorAll("select").forEach(select=>{
select.selectedIndex=0
})
    
// Close confirmation modal and show success modal
closeResetModal()
document.getElementById("resetSuccessModal").style.display="block"
    
// Auto-close success modal after 3 seconds
setTimeout(closeResetSuccessModal, 3000)
}

function closeResetSuccessModal(){
document.getElementById("resetSuccessModal").style.display="none"
}

window.onload=loadSettings