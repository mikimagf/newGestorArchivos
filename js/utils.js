// Función para mostrar mensajes de alerta
function showAlert(message, type = 'info') {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    if (!alertPlaceholder) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');

    alertPlaceholder.append(wrapper);

    // Eliminar la alerta después de 5 segundos
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(wrapper.firstElementChild);
        alert.close();
    }, 5000);
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

// Exportar las funciones para que estén disponibles en otros archivos
export {
    showAlert,
    formatDate,
    isValidEmail,
    getToken,
    setToken,
    removeToken,
    isAuthenticated,
    requireAuth
}; 
