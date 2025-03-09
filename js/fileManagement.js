import { showCustomAlerta, showCustomConfirm } from './utils.js';

let filesTable;
let currentPage = 1;
let pageSize = 10;

export function initializeFileManagement() {
    console.log('Inicializando módulo de gestión de archivos');
    document.getElementById('uploadFileBtn').addEventListener('click', openUploadModal);
    
    document.addEventListener('click', function (event) {
        if (event.target && event.target.id === 'saveFileBtn') {
          
            guardarArchivo();
        }
    });
    cargarArchivos();
}

async function cargarArchivos() {
  
    console.log('Iniciando carga de archivos...');

    try {
        const response = await fetch(`api/files.php`, {
            method: 'GET',
            credentials: 'include' // Esto asegura que las cookies se envíen con la solicitud
        });

        const data = await response.json();

        console.log('Respuesta completa del servidor Files:', data);

        if (data.success) {
            let files;
            if (Array.isArray(data.files)) {
                files = data.files;
            } else if (data.files && Array.isArray(data.files.files)) {
                files = data.files.files;
            } else {
                throw new Error('Estructura de archivos no reconocida');
            }

            renderizarTableArchivos(files);
        } else {
            throw new Error(data.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error:', error);
        showCustomAlerta('Error al cargar archivos', 'error');
    }
   

}

function renderizarTableArchivos(files) {
    console.log("Iniciando renderización de tabla de Archivos");
    console.log("Número total de archivos a renderizar:", files.length);

    const container = document.getElementById('filesTable');

    // Destruir la tabla existente si ya existe
    if (filesTable && typeof filesTable.destroy === 'function') {
        console.log("Destruyendo tabla existente");
        filesTable.destroy();
    }

    // Limpiar el contenido del contenedor
    console.log("Limpiando contenedor de la tabla");
    container.innerHTML = '';

    // Crear la estructura de la tabla
    console.log("Creando nueva estructura de tabla");
    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered';
    container.appendChild(table);

    // Crear una nueva tabla
    console.log("Inicializando nueva tabla con simpleDatatables");
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
        columns: [
            //{ select: 3, type: "select", options: getUniqueCategories(files) }
        ],
        labels: {
            placeholder: "Buscar nombre o categoria...",
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
        },
        layout: {
            top: "{search}",
            bottom: "{select}{info}{pager}"
        },
        dom: '<"top"f>rt<"bottom"lip><"clear">',
        searchable: true,
        responsive: true,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
        }
    });

    console.log("Tabla creada:", filesTable);
    console.log("Configuración de la tabla:", filesTable.options);

    // Verificar la virtualización
    console.log("Número de filas renderizadas inicialmente:", document.querySelectorAll('#filesTable tbody tr').length);
    console.log("Altura total de la tabla:", table.offsetHeight);

    // Agregar un listener para el evento de scroll
    container.addEventListener('scroll', () => {
        console.log("Scroll detectado");
        console.log("Filas visibles:", document.querySelectorAll('#filesTable tbody tr:not(.htHidden)').length);
    });
}

// export function updateCategoryFilter(categories) {
//     // const categoryFilter = document.getElementById('categoryFilter');
//     // categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
//     // categories.forEach(category => {
//     //     const option = document.createElement('option');
//     //     option.value = category.id;
//     //     option.textContent = category.name;
//     //     categoryFilter.appendChild(option);
//     // });
// }


async function downloadFile(id) {
   
    try {
        showCustomAlerta('Iniciando descarga...', 'info');

        const response = await fetch(`api/files.php?action=download&id=${id}`, {
            method: 'GET',
            credentials: 'include' // Esto asegura que las cookies se envíen con la solicitud
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showCustomAlerta('Descarga completada', 'success');
    } catch (error) {
        console.error('Error en la descarga:', error);
        showCustomAlerta(`Error en la descarga: ${error.message}`, 'error');
    }
}

window.deleteFile = async function (id) {
  
    try {
        const result = await showCustomConfirm('¿Estás seguro de que quieres eliminar este archivo?');
        if (result.isConfirmed) {
            const response = await fetch('api/files.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id }),
                credentials: 'include' // Esto asegura que las cookies se envíen con la solicitud
            });
            const data = await response.json();
            if (data.success) {
                await cargarArchivos();
                showCustomAlerta("Archivo eliminado con éxito", 'success');
            } else {
                showCustomAlerta('Error al eliminar archivo: ' + data.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showCustomAlerta('Error al eliminar archivo', 'error');
    }
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
            const response = await fetch('api/files.php', {
                method: 'POST',
                body: formData,
                credentials: 'include' // Esto asegura que las cookies se envíen con la solicitud
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }

            // Actualizar la barra de progreso
            updateProgressBar((chunkNumber + 1) / totalChunks * 100);

        } catch (error) {
            console.error('Error uploading chunk:', error);
            showCustomAlerta('Error al subir archivo: ' + error.message, 'error');
            throw error;
        }
    }

    console.log('File upload completed');
    showCustomAlerta('Archivo subido con éxito', 'success');
    cargarArchivos();
    const modal = bootstrap.Modal.getInstance(document.getElementById('uploadFileModal'));
    modal.hide();
}

// Función para actualizar la barra de progreso
function updateProgressBar(percentage) {
    // Implementa esta función según tu interfaz de usuario
    console.log(`Upload progress: ${percentage}%`);
    // Por ejemplo:
    // document.getElementById('uploadProgress').style.width = `${percentage}%`;
    // document.getElementById('uploadProgress').textContent = `${Math.round(percentage)}%`;
}

// Reemplazar la función guardarArchivo existente con esta nueva versión
async function guardarArchivo() {
    const form = document.getElementById('uploadFileForm');
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    const fileName = document.getElementById('fileName')?.value;
    const fileCategory = document.getElementById('fileCategory')?.value;
    const fileUpload = document.getElementById('fileUpload')?.files?.[0];
    console.log("Guardando archivo...");
    console.log("Nombre del archivo:", fileName);
    console.log("Categoría:", fileCategory);
    console.log("Archivo:", fileUpload);
    console.log("----------------------------------");

    if (fileName && fileCategory && fileUpload) {
        try {
            await uploadFile(fileUpload, fileName, fileCategory);
            showCustomAlerta('Archivo subido con éxito', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('uploadFileModal'));
            modal.hide();
            // Después de subir el archivo con éxito:
            form.classList.remove('was-validated');
            await cargarArchivos();

        } catch (error) {
            console.error('Error:', error);
            showCustomAlerta('Error al subir archivo: ' + error.message, 'error');
        }
    } else {
        showCustomAlerta('Por favor, complete todos los campos', 'warning');
    }
}




function openUploadModal() {
    console.log("abriendo modal");
    
    document.getElementById('uploadFileForm').reset();
    loadCategories();
    console.log("categorias cargadas");
    
   const modal = new bootstrap.Modal(document.getElementById('uploadFileModal'));
//    const modal = new window.bootstrap.Modal(document.getElementById('uploadFileModal'));

    modal.show();
}
async function loadCategories() {
  
    try {
        const response = await fetch('api/categories.php', {
            method: 'GET',
            credentials: 'include' // Esto asegura que las cookies se envíen con la solicitud
        });

        const data = await response.json();
        console.log("data cargada:",data);

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
            showCustomAlerta('Error al cargar categorías: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showCustomAlerta('Error al cargar categorías', 'error');
    }
}

// Exponer funciones necesarias globalmente
window.downloadFile = downloadFile;
window.cargarArchivos = cargarArchivos;

export { cargarArchivos, downloadFile };