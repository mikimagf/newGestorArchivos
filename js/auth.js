document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      console.log("usuario:", username, "Contraseña:", password);

      login(username, password);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nombre = document.getElementById("nombre").value;
      const apellido = document.getElementById("apellido").value;
      const email = document.getElementById("email").value;
      const username = document.getElementById("usuario").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }

      register(nombre, apellido, email, username, password);
    });
  }
});

function login(username, password) {
  console.log("Iniciando proceso de login");
  fetch("api/auth.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "login", username, password }),
    credentials: 'include'
  })
    .then((respose) => {
      return respose.json();
    })
    .then((data) => {
      console.log("Respuesta de login:", data);
      if (data.success) {
        //verificamos si la cookie esta presente y es válida para el login
        // if (document.cookie.includes("jwt")) {
          
        // } else {
        //   localStorage.setItem("jwt", data.token);
        // }
        window.location.href = "dashboard";
      } else {
        console.error("Error de inicio de sesión:", data.message);
        alert("Error de inicio de sesión: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error en la solicitud de login:", error);
      alert("Error al iniciar sesión");
    });
}

function register(nombre, apellido, email, username, password) {
  fetch("api/auth.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "register",
      nombre: nombre,
      apellido: apellido,
      email: email,
      username: username,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Registro exitoso. Por favor, inicia sesión.");
        window.location.href = "index.html"; // Redirige a la página de inicio de sesión
      } else {
        alert("Error de registro: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al registrar");
    });
}
