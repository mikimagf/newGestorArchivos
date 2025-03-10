// Verificar autenticación inmediatamente
fetch("api/auth.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "check_auth" }),
    credentials: "include"
  })
  .then(response => response.json())
  .then(data => {
    if (data.authenticated) {
      window.location.href = "dashboard";
    } else {
      document.body.style.display = 'block';
    }
  })
  .catch(error => {
    document.body.style.display = 'block';
  });