// Función para mostrar mensajes de alerta
function showAlert(message, type = 'info') {
    const iconMap = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };

    Swal.fire({
        icon: iconMap[type] || 'info',
        title: message,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}
// Función para mostrar alertas personalizadas usando SweetAlert2
function showCustomAlerta(message, type = 'info') {
    const iconMap = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };

    return Swal.fire({
        icon: iconMap[type] || 'info',
        title: message,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}

// Función para mostrar confirmación personalizada usando SweetAlert2
function showCustomConfirm(message, confirmButtonText = 'Sí', cancelButtonText = 'No') {
    return Swal.fire({
        title: '¿Estás seguro?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText
    });
}

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para validar el formato de email
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Función para obtener el token del almacenamiento local
function getToken() {
    return localStorage.getItem('token');
}

// Función para establecer el token en el almacenamiento local
function setToken(token) {
    localStorage.setItem('token', token);
}

// Función para eliminar el token del almacenamiento local
function removeToken() {
    localStorage.removeItem('token');
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return !!getToken();
}

// Función para redirigir al usuario si no está autenticado
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index';
    }
}
/**
 * Cierra un modal de Bootstrap y limpia los backdrops residuales.
 * @param {string} modalId - El ID del elemento del modal.
 */
function cerrarYLimpiarModal(modalId) {
    const modalElement = document.getElementById(modalId);
    const modal = bootstrap.Modal.getInstance(modalElement);
    
    if (modal) {
        modal.hide();
        
        // Limpiar backdrops y restaurar el body después de que se complete la animación de cierre
        setTimeout(() => {
            const backdrops = document.getElementsByClassName('modal-backdrop');
            while (backdrops.length > 0) {
                backdrops[0].parentNode.removeChild(backdrops[0]);
            }
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 300); // Ajusta este tiempo si la animación de cierre es más larga
    }
    
    // Restablecer el atributo aria-hidden
    modalElement.setAttribute('aria-hidden', 'true');
    
    // Limpiar los campos del formulario si es necesario
    // Puedes personalizar esta parte según tus necesidades
    const form = modalElement.querySelector('form');
    if (form) form.reset();
}

// Exportar las funciones para que estén disponibles en otros archivos
export {
        showCustomAlerta,
    showCustomConfirm,
    showAlert,
    formatDate,
    isValidEmail,
    getToken,
    setToken,
    removeToken,
    isAuthenticated,
    requireAuth
}; 
