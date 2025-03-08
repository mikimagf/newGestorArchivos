
import { cargarArchivos } from './fileManagement.js';
document.addEventListener('DOMContentLoaded', async function () {
   
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'index';
        return;
    }


    async function cargarMenuNavegacion() {
        try {
            const response = await fetch('components/menu_navegacion.html');
            const menuContent = await response.text();
            const navPlaceholder = document.getElementById('navPlaceholder');
            if (navPlaceholder) {
                navPlaceholder.innerHTML = menuContent;
                configureEventListeners();
                
                document.dispatchEvent(new CustomEvent('navPlaceholderLoaded'));
            }
        } catch (error) {
            console.error("Error al cargar el menú de navegación:", error);
        }
    }

    async function configureEventListeners() {
        const dashboardLink = document.getElementById('dashboardLink');
        const categoriesLink = document.getElementById('categoriesLink');
        const filesLink = document.getElementById('filesLink');
        const logoutBtn = document.getElementById('logoutBtn');

        if (dashboardLink) dashboardLink.addEventListener('click', showDashboard);
        if (categoriesLink) categoriesLink.addEventListener('click', showCategories);
        if (filesLink) filesLink.addEventListener('click', showFiles);
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
    };
   
    async function loadDashboardData() {
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
    async function cargarContenidoDashboard() {
        try {
            const response = await fetch('components/pages/dashboard/dashboard-content.html');
            const content = await response.text();
            document.getElementById('dashboardContentPlaceholder').innerHTML = content;
            
            loadDashboardData();
        } catch (error) {
            console.error('Error al cargar el contenido del dashboard:', error);
        }
    }

    async function setActiveTab(activeLink) {
        [dashboardLink, categoriesLink, filesLink].forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
    async function showDashboard() {
        setActiveTab(dashboardLink);
        await cargarContenidoDashboard();
        const dashboardContent = document.getElementById('dashboardContent');
        const categoriesContent = document.getElementById('categoriesContent');
        const filesContent = document.getElementById('filesContent');
        dashboardContent.style.display = 'block';
        categoriesContent.style.display = 'none';
        filesContent.style.display = 'none';
    }

    // Función para cargar un modal
    async function cargarModal(modalId, modalFile) {
        try {

            const response = await fetch(`modals/${modalFile}`);
            //const response = await fetch('modals/'+modalFile);
            const modalContent = await response.text();
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                modalElement.innerHTML = modalContent;
                // Emitir un evento personalizado cuando el modal se haya cargado
                document.dispatchEvent(new CustomEvent(`${modalId}Loaded`));
            }
        } catch (error) {
            console.error("error entontrado:", error);

        }
    }


    async function showCategories() {
        dashboardContent.style.display = 'none';
        categoriesContent.style.display = 'block';
        filesContent.style.display = 'none';
        await cargarCategorias();
        setActiveTab(categoriesLink);

    }

    async function showFiles() {
        dashboardContent.style.display = 'none';
        categoriesContent.style.display = 'none';
        filesContent.style.display = 'block';
        setActiveTab(filesLink);
        await cargarArchivos();
    }

    async function logout() {
        try {
            // Obtener el token actual
            const token = localStorage.getItem('token');

            // Llamada al servidor para invalidar el token
            const response = await fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action: 'logout' })
            });

            // Verificar si la respuesta es JSON válido
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if (data.success) {
                    // Proceso de logout exitoso
                    clearSessionData();
                    window.location.href = 'index';
                } else {
                    throw new Error(data.message || 'Error durante el logout');
                }
            } else {
                // La respuesta no es JSON, manejar como error
                const textResponse = await response.text();
                throw new Error(`Respuesta no válida del servidor: ${textResponse}`);
            }
        } catch (error) {
            console.error('Error durante el logout:', error);
            alert('Error durante el logout: ' + error.message);
        }
    }

    function clearSessionData() {
        // Eliminar el token del almacenamiento local
        localStorage.removeItem('token');

        // Limpiar el almacenamiento local
        localStorage.clear();

        // Limpiar el almacenamiento de sesión
        sessionStorage.clear();

        // Eliminar todas las cookies
        document.cookie.split(";").forEach(function (c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    }

    await cargarMenuNavegacion();
    await showDashboard();
    await showFiles()
    await showCategories();


    // Cargar los modales
    await cargarModal("categoryModalPlaceholder", "category-modal.html");
    await cargarModal('uploadFileModalPlaceholder', 'upload-file-modal.html');

    document.addEventListener('navPlaceholderLoaded', () => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    });

}); 
