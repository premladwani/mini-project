// Charts

new Chart(document.getElementById('attendanceChart'), {

  type: 'doughnut',

  data: {

    labels: ['Present','Absent'],

    datasets: [{

      data: [95,25],

      backgroundColor: ['#22c55e','#ef4444']

    }]

  }

});



new Chart(document.getElementById('weeklyChart'), {

  type: 'line',

  data: {

    labels: ['Mon','Tue','Wed','Thu','Fri'],

    datasets: [{

      label: 'Attendance %',

      data: [85,90,88,92,95],

      borderColor: '#38bdf8',

      tension: 0.4

    }]

  }

});



// Search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const value = this.value.toLowerCase();
      const rows = document.querySelectorAll('#attendanceTable tr');
      
      rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        
        const nameCell = row.cells[0];
        if (nameCell) {
          const name = nameCell.textContent.toLowerCase();
          row.style.display = name.includes(value) ? '' : 'none';
        }
      });
    });
  }
});

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  const rows = document.querySelectorAll('#attendanceTable tr');
  
  if (searchInput) {
    searchInput.value = '';
  }
  
  rows.forEach(row => {
    row.style.display = '';
  });
}



// Theme toggle

function toggleTheme(){

  document.body.classList.toggle('dark');

  const btn = document.getElementById('themeBtn');

  if (btn) {

    btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';

  }

  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');

}



// Initialize theme on page load

document.addEventListener('DOMContentLoaded', function(){

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {

    document.body.classList.add('dark');

    const btn = document.getElementById('themeBtn');

    if (btn) btn.textContent = '☀️';

  }

});

