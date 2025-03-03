let categoriesTable;
let allCategories = [];

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
            allCategories = data.categories;
            filterAndRenderCategories();
        } else {
            showAlert('Error al cargar categorías: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error al cargar categorías', 'error');
    });
}

function filterAndRenderCategories() {
    const searchTerm = document.getElementById('categorySearch').value.toLowerCase();
    const pageSize = parseInt(document.getElementById('categoryPageSize').value);
    
    const filteredCategories = allCategories.filter(category => 
        category.name.toLowerCase().includes(searchTerm)
    );

    renderCategoriesTable(filteredCategories);
}

document.getElementById('categorySearch').addEventListener('input', filterAndRenderCategories);
document.getElementById('categoryPageSize').addEventListener('change', filterAndRenderCategories);

document.addEventListener('DOMContentLoaded', loadCategories);

function renderCategoriesTable(categories) {
    const container = document.getElementById('categoriesTable');
    if (categoriesTable) {
        categoriesTable.destroy();
    }
    categoriesTable = new Handsontable(container, {
        data: categories,
        columns: [
            { data: 'id', title: 'ID', readOnly: true, width: 50 },
            { data: 'name', title: 'Nombre', width: 200 },
            {
                data: 'actions',
                title: 'Acciones',
                renderer: function(instance, td, row, col, prop, value, cellProperties) {
                    const deleteBtn = `<button class="btn btn-danger btn-sm" onclick="deleteCategory(${categories[row].id})">Eliminar</button>`;
                    td.innerHTML = deleteBtn;
                    return td;
                },
                width: 100
            }
        ],
        rowHeaders: true,
        colHeaders: true,
        height: 'auto',
        stretchH: 'all',
        className: 'htCenter',
        licenseKey: 'non-commercial-and-evaluation',
        pageLength: 10,
        language: 'es-ES',
        pagination: true,
        paginationOptions: {
            pageLength: 10,
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]]
        },
        dropdownMenu: true,
        filters: true,
        contextMenu: true,
        manualColumnResize: true,
        manualRowResize: true,
        autoColumnSize: true,
        autoRowSize: true,
        i18n: {
            'es-ES': {
                'pageNext': 'Siguiente página',
                'pagePrevious': 'Página anterior',
                'pageOf': 'de',
                'rows': 'Filas',
                'rowsPerPage': 'Filas por página',
                'dropdownMenuButton': 'Abrir menú',
                'filterConditions': {
                    'contains': 'Contiene',
                    'not_contains': 'No contiene',
                    'begins_with': 'Comienza con',
                    'ends_with': 'Termina con',
                    'eq': 'Igual a',
                    'neq': 'No igual a'
                }
            }
        }
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
                document.getElementById('categoryName').value = '';
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

document.getElementById('addCategoryModal').addEventListener('show.bs.modal', function() {
    document.getElementById('categoryName').value = '';
});

function showAlert(message, type) {
    alert(message);
}