async function adminLogoutUser(userId) {
    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'admin_logout_user', user_id: userId }),
            credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
            alert('Sesiones del usuario cerradas exitosamente');
        } else {
            alert('Error al cerrar las sesiones del usuario: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cerrar las sesiones del usuario');
    }
}