
import { cargarArchivos } from './fileManagement.js';
document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index';
        return;
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
    // Cargar los modales
    await cargarModal("categoryModalPlaceholder", "category-modal.html");
    await cargarModal('uploadFileModalPlaceholder', 'upload-file-modal.html');


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
        setActiveTab(dashboardLink);
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
        await cargarArchivos();
        setActiveTab(filesLink);
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

    // Asegúrate de que el event listener para el botón de logout esté configurado correctamente
    document.addEventListener('navPlaceholderLoaded', () => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    });
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

    function setActiveTab(activeLink) {
        [dashboardLink, categoriesLink, filesLink].forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Inicialmente, mostrar el dashboard
    showDashboard();

    //  // Manejar la navegación basada en el hash de la URL
    //  function handleNavigation() {
    //     const hash = window.location.hash;
    //     switch (hash) {
    //         case '#dashboard':
    //             showDashboard();
    //             break;
    //         case '#categories':
    //             showCategories();
    //             break;
    //         case '#files':
    //             showFiles();
    //             break;
    //         default:
    //             showDashboard();
    //             break;
    //     }
    // }

    // // Escuchar cambios en el hash de la URL
    // window.addEventListener('hashchange', handleNavigation);

    // // Inicialmente, manejar la navegación
    // handleNavigation();
}); 
