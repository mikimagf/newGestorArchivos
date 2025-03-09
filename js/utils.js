// Función para mostrar mensajes de alerta
function showAlert(message, type = "info") {
  const iconMap = {
    success: "success",
    error: "error",
    warning: "warning",
    info: "info",
  };

  Swal.fire({
    icon: iconMap[type] || "info",
    title: message,
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
}
// Función para mostrar alertas personalizadas usando SweetAlert2
function showCustomAlerta(message, type = "info") {
  const iconMap = {
    success: "success",
    error: "error",
    warning: "warning",
    info: "info",
  };

  return Swal.fire({
    icon: iconMap[type] || "info",
    title: message,
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
}

// Función para mostrar confirmación personalizada usando SweetAlert2
function showCustomConfirm(
  message,
  confirmButtonText = "Sí",
  cancelButtonText = "No"
) {
  return Swal.fire({
    title: "¿Estás seguro?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
  });
}

// Función para formatear fechas
function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}

// Función para validar el formato de email
function isValidEmail(email) {
  const re =
    /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function checkAuthentication() {
  return fetch("api/auth.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "check_auth" }),
    credentials: "include", 
  })
    .then((response) => {
      // console.log('Response status:', response.status);
      // console.log('Response headers:', response.headers);
      // console.log('Response type:', response.type);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.text();  // Cambiamos a .text() en lugar de .json()
    })
    .then((text) => {
      
      if (!text) {
        //console.log('Response body is empty');
        return false;
      }
      
      try {
        const data = JSON.parse(text);
        //console.log('Parsed JSON data:', data);
        return data.authenticated || false;
      } catch (e) {
        //console.error('Error parsing JSON:', e);
        return false;
      }
    })
    .catch((error) => {
      //console.error("Error al verificar la autenticación:", error);
      //alert("Error al verificar la autenticación");
      return false;
    });
}
// Función para redirigir al usuario si no está autenticado
async function requireAuth() {
  // if (!await isAuthenticated()) {
  //     window.location.href = 'index';
  // }
  if (!(await checkAuthentication())) {
    window.location.href = "index";
  }
}
// Exportar las funciones para que estén disponibles en otros archivos
export {
  showCustomAlerta,
  showCustomConfirm,
  showAlert,
  formatDate,
  isValidEmail,
  checkAuthentication,
  requireAuth,
};
