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

      return response.text(); // Cambiamos a .text() en lugar de .json()
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
export async function fetchWithRedirectCheck(url, options = {}) {
  const response = await fetch(url, { ...options, credentials: "include",  headers: {
    'Content-Type': 'application/json'
}, });

  console.log("Respuesta completa:", response);
  console.log("URL:", response.url);
  console.log("Status:", response.status);
  console.log("Status Text:", response.statusText);
  console.log("redirected:", response.redirected);
  console.log("Type:", response.type);
  console.log("Headers:", Object.fromEntries(response.headers));

  if (response.redirected) {
    console.log("Se detectó una redirección a:", response.url);
    if (response.url !== window.location.href) {
      console.log("Redirigiendo a la nueva URL...");
      window.location.replace(response.url);
      return null; // Terminamos la ejecución aquí ya que estamos redirigiendo
    } else {
      console.log("Ya estamos en la URL de redirección.");
    }
  }
  try {
    const jsonData = await response.clone().json();
    console.log("JSON Data:", jsonData);
    
  } finally{
    
    return response;
  }
}
let progressSwal;

async function updateProgressBar(percentage) {
    console.log(`Upload progress: ${percentage}%`);

    if (!progressSwal) {
        progressSwal = Swal.fire({
            title: 'Subiendo archivo',
            html: 'Progreso: <b>0%</b>',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    Swal.update({
        html: `Progreso: <b>${Math.round(percentage)}%</b>`
    });

    if (percentage >= 100) {
        setTimeout(() => {
            Swal.update({
                title: 'Carga completada',
                html: 'El archivo se ha subido con éxito.',
                icon: 'success',
                showConfirmButton: true
            });
            progressSwal = null;
        }, 1000);
    }
}
// Exportar las funciones para que estén disponibles en otros archivos
export {
  updateProgressBar,
  showCustomAlerta,
  showCustomConfirm,
  showAlert,
  formatDate,
  isValidEmail,
  checkAuthentication,
  requireAuth,
};
