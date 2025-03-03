
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index';
        return;
    }

    const dashboardLink = document.getElementById('dashboardLink');
    const categoriesLink = document.getElementById('categoriesLink');
    const filesLink = document.getElementById('filesLink');
    const logoutBtn = document.getElementById('logoutBtn');

    const dashboardContent = document.getElementById('dashboardContent');
    const categoriesContent = document.getElementById('categoriesContent');
    const filesContent = document.getElementById('filesContent');

    dashboardLink.addEventListener('click', showDashboard);
    categoriesLink.addEventListener('click', showCategories);
    filesLink.addEventListener('click', showFiles);
    logoutBtn.addEventListener('click', logout);

    function showDashboard() {
        dashboardContent.style.display = 'block';
        categoriesContent.style.display = 'none';
        filesContent.style.display = 'none';
        loadDashboardData();
    }

    function showCategories() {
        dashboardContent.style.display = 'none';
        categoriesContent.style.display = 'block';
        filesContent.style.display = 'none';
        loadCategories();
    }

    function showFiles() {
        dashboardContent.style.display = 'none';
        categoriesContent.style.display = 'none';
        filesContent.style.display = 'block';
        loadFiles();
    }

    function logout() {
        localStorage.removeItem('token');
        window.location.href = 'index';
    }

    function loadDashboardData() {
        fetch('api/dashboard.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalFiles').textContent = data.totalFiles;
                document.getElementById('totalCategories').textContent = data.totalCategories;
                const recentActivityList = document.getElementById('recentActivity');
                recentActivityList.innerHTML = '';
                data.recentActivity.forEach(activity => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.textContent = activity;
                    recentActivityList.appendChild(li);
                });
            } else {
                alert('Error al cargar datos del dashboard: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar datos del dashboard');
        });
    }

    // Inicialmente, mostrar el dashboard
    showDashboard();
}); 
