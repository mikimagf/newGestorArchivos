
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const email = document.getElementById('email').value;
            const usuario = document.getElementById('usuario').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }

            register(nombre, apellido, email, usuario, password);
        });
    }
});

function login(username, password) {
    fetch('api/auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'login', username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard';
        } else {
            alert('Error de inicio de sesión: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    });
}

function register(nombre, apellido, email, usuario, password) {
    fetch('api/auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'register', nombre, apellido, email, usuario, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Registro exitoso. Por favor, inicia sesión.');
            window.location.href = 'index';
        } else {
            alert('Error de registro: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al registrar');
    });
} 
