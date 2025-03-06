export { updateCategoryFilter };
let filesTable;

function cargarArchivos() {
    const token = localStorage.getItem('token');
    fetch('api/files.php', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos de la API:', data); // Para depuración
            if (data.success) {
                renderizarTableArchivos(data.files);
                if (data.categories) {
                    updateCategoryFilter(data.categories);
                }
            } else {
                alert('Error al cargar archivos: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar archivos');
        });
}

function renderizarTableArchivos(files) {
    const container = document.getElementById('filesTable');
    if (filesTable) {
        filesTable.destroy();
    }
    filesTable = new Handsontable(container, {
        data: files,
        columns: [
            { data: 'id', title: 'ID', readOnly: true },
            { data: 'name', title: 'Nombre' },
            { data: 'filename', title: 'Nombre del archivo' },
            { data: 'category_id', title: 'ID de Categoría' },
            { data: 'user_id', title: 'ID de Usuario' },
            { data: 'upload_date', title: 'Fecha de subida', readOnly: true },
            {
                data: 'actions',
                title: 'Acciones',
                renderer: function (instance, td, row, col, prop, value, cellProperties) {
                    const downloadBtn = `<button class="btn btn-primary btn-sm me-1" onclick="downloadFile(${files[row].id})">Descargar</button>`;
                    const deleteBtn = `<button class="btn btn-danger btn-sm" onclick="deleteFile(${files[row].id})">Eliminar</button>`;
                    td.innerHTML = downloadBtn + deleteBtn;
                    return td;
                }
            }
        ],
        rowHeaders: true,
        colHeaders: true,
        height: 'auto',
        licenseKey: 'non-commercial-and-evaluation'
    });
}

function updateCategoryFilter(categories) { 
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

window.downloadFile = function(id) {
    const token = localStorage.getItem('token');
    window.location.href = `api/files.php?action=download&id=${id}&token=${token}`;
}
 
window.deleteFile = function(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
        const token = localStorage.getItem('token');
        fetch('api/files.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: id }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cargarArchivos();
                } else {
                    alert('Error al eliminar archivo: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar archivo');
            });
    }
}

function guardarArchivo() {
    const fileName = document.getElementById('fileName').value;
    const fileCategory = document.getElementById('fileCategory').value;
    const fileUpload = document.getElementById('fileUpload').files[0];
    if (fileName && fileCategory && fileUpload) {
        const formData = new FormData();
        formData.append('name', fileName);
        formData.append('category', fileCategory);
        formData.append('file', fileUpload);

        const token = localStorage.getItem('token');
        fetch('api/files.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cargarArchivos();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('uploadFileModal'));
                    modal.hide();
                } else {
                    alert('Error al subir archivo: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al subir archivo');
            });
    }
}

function openUploadModal() {
    document.getElementById('uploadFileForm').reset();
    loadCategories();
    const modal = new bootstrap.Modal(document.getElementById('uploadFileModal'));
    modal.show();
}

async function loadCategories() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('api/categories.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        const data = await response.json();
        
        if (data.success) {
            const categorySelect = document.getElementById('fileCategory');
            categorySelect.innerHTML = '<option value="">Seleccione una categoría</option>';
            
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } else {
            console.error('Error al cargar categorías:', data.message);
            alert('Error al cargar categorías: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar categorías');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('uploadFileBtn').addEventListener('click', openUploadModal);
    cargarArchivos(); // Cargar archivos al iniciar la página

    // Agregar un event listener al documento para manejar clics en el botón saveFileBtn
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'saveFileBtn') {
            guardarArchivo();
        }
    });
});

// Agregar un event listener para cuando el modal de carga de archivos se haya cargado
document.addEventListener('uploadFileModalLoaded', function() {
    console.log('Modal de carga de archivos cargado');
    // Aquí puedes agregar cualquier inicialización adicional necesaria para el modal
});

window.cargarArchivos = cargarArchivos;