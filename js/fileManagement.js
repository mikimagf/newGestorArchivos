
let filesTable;

function loadFiles() {
    const token = localStorage.getItem('token');
    fetch('api/files.php', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderFilesTable(data.files);
                updateCategoryFilter(data.categories);
            } else {
                alert('Error al cargar archivos: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar archivos');
        });
}

function renderFilesTable(files) {
    const container = document.getElementById('filesTable');
    if (filesTable) {
        filesTable.destroy();
    }
    filesTable = new Handsontable(container, {
        data: files,
        columns: [
            { data: 'id', title: 'ID', readOnly: true },
            { data: 'name', title: 'Nombre' },
            { data: 'category', title: 'Categoría' },
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

function downloadFile(id) {
    const token = localStorage.getItem('token');
    window.location.href = `api/files.php?action=download&id=${id}&token=${token}`;
}

function deleteFile(id) {
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
                    loadFiles();
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

document.getElementById('uploadFileBtn').addEventListener('click', function () {
    const modal = new bootstrap.Modal(document.getElementById('uploadFileModal'));
    modal.show();
});

document.getElementById('saveFileBtn').addEventListener('click', function () {
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
                    loadFiles();
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
});

document.getElementById('fileSearch').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    filesTable.getPlugin('search').query(searchTerm);
    filesTable.render();
});

document.getElementById('categoryFilter').addEventListener('change', function (e) {
    const categoryId = e.target.value;
    filesTable.getPlugin('filters').clearConditions();
    if (categoryId) {
        filesTable.getPlugin('filters').addCondition(1, 'eq', categoryId);
    }
    filesTable.getPlugin('filters').filter();
}); 
