// @ts-nocheck

let categoriesTable;

function loadCategories() {
    const token = localStorage.getItem('token');
    fetch('api/categories.php', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderCategoriesTable(data.categories);
        } else {
            alert('Error al cargar categorías: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al cargar categorías');
    });
}

function renderCategoriesTable(categories) {
    const container = document.getElementById('categoriesTable');
    if (categoriesTable) {
        categoriesTable.destroy();
    }
    categoriesTable = new Handsontable(container, {
        data: categories,
        columns: [
            { data: 'id', title: 'ID', readOnly: true },
            { data: 'name', title: 'Nombre' },
            {
                data: 'actions',
                title: 'Acciones',
                renderer: function(instance, td, row, col, prop, value, cellProperties) {
                    const deleteBtn = `<button class="btn btn-danger btn-sm" onclick="deleteCategory(${categories[row].id})">Eliminar</button>`;
                    td.innerHTML = deleteBtn;
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

function deleteCategory(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
        const token = localStorage.getItem('token');
        fetch('api/categories.php', {
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
                loadCategories();
            } else {
                alert('Error al eliminar categoría: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar categoría');
        });
    }
}

document.getElementById('addCategoryBtn').addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    modal.show();
});

document.getElementById('saveCategoryBtn').addEventListener('click', function() {
    const categoryName = document.getElementById('categoryName').value;
    if (categoryName) {
        const token = localStorage.getItem('token');
        fetch('api/categories.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name: categoryName }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadCategories();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
                modal.hide();
            } else {
                alert('Error al agregar categoría: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al agregar categoría');
        });
    }
}); 

document.getElementById('saveCategoryBtn').addEventListener('click', function() {
    const categoryName = document.getElementById('categoryName').value;
    if (categoryName) {
        const token = localStorage.getItem('token');
        fetch('api/categories.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name: categoryName }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadCategories();
                // Limpiar el campo de entrada
                document.getElementById('categoryName').value = '';
                // Cerrar el modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
                modal.hide();
            } else {
                alert('Error al agregar categoría: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al agregar categoría');
        });
    }
});

// Agregar este evento para limpiar el campo cuando se abre el modal
document.getElementById('addCategoryModal').addEventListener('show.bs.modal', function() {
    document.getElementById('categoryName').value = '';
});


// Ctrl+Shift+[ : Plegar la región actual
//     Ctrl+Shift+] : Desplegar la región actual
//     Ctrl+K Ctrl+[ : Plegar todas las subregiones
//     Ctrl+K Ctrl+] : Desplegar todas las subregiones
//     Ctrl+K Ctrl+0 : Plegar todas las regiones
//     Ctrl+K Ctrl+J : Desplegar todas las regiones