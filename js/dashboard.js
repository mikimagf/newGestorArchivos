import { cargarArchivos,initializeFileManagement } from './fileManagement.js';
import { initializeCategories } from './categories.js';

document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'index';
        return;
    }

    // Función para cargar componentes de la interfaz
    async function cargarInterfaz() {
        await cargarMenuNavegacion();
        await cargarModal("categoryModalPlaceholder", "category-modal.html");
        await cargarModal('uploadFileModalPlaceholder', 'upload-file-modal.html');
        await cargarContenidoDashboard();
        await cargarContenidoCategorias();
        await cargarContenidoArchivos();
        await initializeCategories();
        await initializeFileManagement();
    }

    // Función para cargar datos
    async function cargarDatos() {
        await loadDashboardData();
        // Aquí puedes agregar más llamadas a funciones que carguen datos
    }

    // Cargar la interfaz primero
    await cargarInterfaz();

    // Configurar event listeners
    configureEventListeners();

    // Cargar los datos después de que la interfaz esté lista
    await cargarDatos();

    // Mostrar el dashboard por defecto
   await showDashboard();

    // Resto de tus funciones...
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
    async function cargarMenuNavegacion() {
        try {
            const response = await fetch('components/menu_navegacion.html');
            const menuContent = await response.text();
            const navPlaceholder = document.getElementById('navPlaceholder');
            if (navPlaceholder) {
                navPlaceholder.innerHTML = menuContent;
                

                document.dispatchEvent(new CustomEvent('navPlaceholderLoaded'));
            }
        } catch (error) {
            console.error("Error al cargar el menú de navegación:", error);
        }
    }

    function configureEventListeners() {
        const dashboardLink = document.getElementById('dashboardLink');
        const categoriesLink = document.getElementById('categoriesLink');
        const filesLink = document.getElementById('filesLink');
        const logoutBtn = document.getElementById('logoutBtn');

        if (dashboardLink) dashboardLink.addEventListener('click', showDashboard);
        if (categoriesLink) categoriesLink.addEventListener('click', showCategories);
        if (filesLink) filesLink.addEventListener('click', showFiles);
        if (logoutBtn) logoutBtn.addEventListener('click', logout);

       
    }

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
            //---- contenido dashboard ----
            const response = await fetch('components/pages/dashboard/dashboard-content.html');
            const content = await response.text();
            document.getElementById('dashboardContentPlaceholder').innerHTML = content;
            //loadDashboardData();
        } catch (error) {
            console.error('Error al cargar el contenido del dashboard:', error);
        }
    }

    async function cargarContenidoCategorias() {
        try {
            const response = await fetch('components/pages/categorias/categorias-content.html');
            const content = await response.text();
            document.getElementById('categoriasContentPlaceholder').innerHTML = content;
            // Aquí puedes llamar a una función para cargar datos de categorías si es necesario
        } catch (error) {
            console.error('Error al cargar el contenido de categorías:', error);
        }
    }

    async function cargarContenidoArchivos() {
        try {
            const response = await fetch('components/pages/archivos/archivos-content.html');
            const content = await response.text();
            document.getElementById('archivosContentPlaceholder').innerHTML = content;
            // Aquí puedes llamar a una función para cargar datos de archivos si es necesario
        } catch (error) {
            console.error('Error al cargar el contenido de archivos:', error);
        }
    }

   async function showDashboard() {
        setActiveTab(dashboardLink);
        dashboardContent.style.display = 'block';
        categoriesContent.style.display = 'none';
        filesContent.style.display = 'none';
      //await  loadDashboardData();
    }

  async  function showCategories() {
        setActiveTab(categoriesLink);
        //await cargarCategorias();
        dashboardContent.style.display = 'none';
        categoriesContent.style.display = 'block';
        filesContent.style.display = 'none';
    }

   async function showFiles() {
        setActiveTab(filesLink);
       // await cargarArchivos();
        dashboardContent.style.display = 'none';
        categoriesContent.style.display = 'none';
        filesContent.style.display = 'block';
    }
    async function setActiveTab(activeLink) {
        [dashboardLink, categoriesLink, filesLink].forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
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
    document.addEventListener('navPlaceholderLoaded', () => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    });
});