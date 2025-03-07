import { showCustomAlerta, showCustomConfirm } from './utils.js';

let filesTable;
let currentPage = 1;
let pageSize = 10;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado, iniciando carga de archivos");
    cargarArchivos();
    
    // Agregar event listeners para los filtros
    document.getElementById('fileSearch').addEventListener('input', cargarArchivos);
    document.getElementById('categoryFilter').addEventListener('change', cargarArchivos);
});

async function cargarArchivos() {
    console.log('Iniciando carga de archivos...');
    
    const token = localStorage.getItem('token');
    const searchTerm = document.getElementById('fileSearch').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    try {
        const response = await fetch(`api/files.php?search=${encodeURIComponent(searchTerm)}&category=${categoryFilter}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        const data = await response.json();
        
        console.log('Respuesta completa del servidor:', data);
        
        if (data.success) {
            let files;
            if (Array.isArray(data.files)) {
                files = data.files;
            } else if (data.files && Array.isArray(data.files.files)) {
                files = data.files.files;
            } else {
                throw new Error('Estructura de archivos no reconocida');
            }
            
            console.log('Archivos recibidos:', files);
            console.log('Datos de archivos recibidos, llamando a renderizarTableArchivos');
            renderizarTableArchivos(files);
            console.log('renderizarTableArchivos completado');
            
            if (data.categories) {
                updateCategoryFilter(data.categories);
            }
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error:', error);
        showCustomAlerta('Error al cargar archivos', 'error');
    }
}

function renderizarTableArchivos(files) {
    console.log("Renderizando tabla de Archivos");
    
    const container = document.getElementById('filesTable');
    
    // Destruir la tabla existente si ya existe
    if (filesTable && typeof filesTable.destroy === 'function') {
        filesTable.destroy();
    }

    // Limpiar el contenido del contenedor
    container.innerHTML = '';

    // Crear la estructura de la tabla
    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered';
    container.appendChild(table);

    // Crear una nueva tabla
    filesTable = new simpleDatatables.DataTable(table, {
        data: {
            headings: ["ID", "Nombre", "Nombre del archivo", "Categoría", "Fecha de subida", "Acciones"],
            data: files.map(file => [
                file.id,
                file.name,
                file.filename,
                file.category_name,
                file.upload_date,
                `<button class="btn btn-primary btn-sm me-2" onclick="downloadFile(${file.id})">Descargar</button>
                 <button class="btn btn-danger btn-sm" onclick="deleteFile(${file.id})">Eliminar</button>`
            ])
        },
        perPage: pageSize,
        perPageSelect: [10, 25, 50, 100],
        labels: {
            placeholder: "Buscar...",
            perPage: "Registros por página",
            noRows: "No se encontraron registros",
            info: "Mostrando {start} a {end} de {rows} registros",
            noResults: "No hay resultados que coincidan con su búsqueda",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            }
        }
    });

    console.log("Tabla creada:", filesTable);
}

export function updateCategoryFilter(categories) {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}


function downloadFile(id) {
    const token = localStorage.getItem('token');
    window.location.href = `api/files.php?action=download&id=${id}&token=${token}`;
}

function deleteFile(id) {
    showCustomConfirm('¿Estás seguro de que quieres eliminar este archivo?', async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('api/files.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id: id }),
            });
            const data = await response.json();
            if (data.success) {
                cargarArchivos();
                showCustomAlerta("Archivo eliminado con éxito", 'success');
            } else {
                showCustomAlerta('Error al eliminar archivo: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showCustomAlerta('Error al eliminar archivo', 'error');
        }
    });
}

async function uploadFile(file, fileName, categoryId) {
    const chunkSize = 1024 * 1024; // 1MB por chunk
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        const start = chunkNumber * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('action', 'upload_chunk');
        formData.append('file', chunk);
        formData.append('fileName', fileName);
        formData.append('originalName', file.name);
        formData.append('chunkNumber', chunkNumber);
        formData.append('totalChunks', totalChunks);
        formData.append('categoryId', categoryId);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('api/files.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error uploading chunk:', error);
            throw error;
        }
    }
}

function openUploadModal() {
    fetch('modals/upload-file-modal.html')
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            const modal = new bootstrap.Modal(document.getElementById('uploadFileModal'));
            modal.show();

            document.getElementById('uploadForm').addEventListener('submit', handleFileUpload);
        });
}

async function handleFileUpload(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const fileName = document.getElementById('fileName').value;
    const categoryId = document.getElementById('fileCategory').value;

    if (!file || !fileName) {
        showCustomAlerta('Por favor, seleccione un archivo y proporcione un nombre', 'warning');
        return;
    }

    try {
        await uploadFile(file, fileName, categoryId);
        showCustomAlerta('Archivo subido con éxito', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('uploadFileModal'));
        modal.hide();
        cargarArchivos();
    } catch (error) {
        console.error('Error:', error);
        showCustomAlerta('Error al subir archivo: ' + error.message, 'error');
    }
}

// Exponer funciones necesarias globalmente
window.downloadFile = downloadFile;
window.deleteFile = deleteFile;
window.openUploadModal = openUploadModal;

export { cargarArchivos, downloadFile, deleteFile, openUploadModal };