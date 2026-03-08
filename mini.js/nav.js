/* SIDEBAR */

function toggleSidebar(){
document.getElementById("sidebar").classList.toggle("active");
}

/* THEME */

function toggleTheme(){
const body = document.body;
const themeBtn = document.querySelector(".toggle");
    
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

/* SEARCH FUNCTIONALITY */

function filterLinks() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes(searchInput)) {
            link.style.display = 'flex';
        } else {
            link.style.display = 'none';
        }
    });
}

/* CLICK OUTSIDE TO CLOSE */

document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const rfidBtn = document.querySelector('.rfid-btn');
    
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(event.target) && 
        !rfidBtn.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});

/* LOGOUT FUNCTIONALITY */

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored session data
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page or home page
        window.location.href = 'login.html';
    }
}
