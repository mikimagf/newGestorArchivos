import { showCustomAlert, showCustomConfirm } from './utils.js';

async function getAlertFunctions() {
    const utils = await import('./utils.js');
    return {
        showAlert: utils.showAlert,
        showCustomAlert: utils.showCustomAlert
    };
}

let categoriesTable;
let allCategories = [];
let currentPage = 1;
let itemsPerPage = 10;
// const itemsPerPage = 10; // Puedes ajustar este valor según tus necesidades

// function loadCategories() {
//     const token = localStorage.getItem('token');
//     fetch('api/categories.php', {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//         },
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             allCategories = data.categories;
//             filterAndRenderCategories();
//             renderPagination();
//         } else {
//             showAlert('Error al cargar categorías: ' + data.message, 'error');
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         showAlert('Error al cargar categorías', 'error');
//     });
// }
async function getShowCustomAlert() {
    const utils = await import('./utils.js');
    return utils.showCustomAlert;
}
window.loadCategories=async function () {
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
            allCategories = data.categories;
            filterAndRenderCategories();
        } else {
            const showCustomAlert = await getShowCustomAlert();
            showCustomAlert('Error al cargar categorías: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        const showCustomAlert = await getShowCustomAlert();
        showCustomAlert('Error al cargar categorías', 'error');
    }
}

function filterAndRenderCategories() {
    const searchTerm = document.getElementById('categorySearch').value.toLowerCase();
    itemsPerPage = parseInt(document.getElementById('categoryPageSize').value);
    
    const filteredCategories = allCategories.filter(category => 
        category.name.toLowerCase().includes(searchTerm)
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const categoriesToRender = filteredCategories.slice(startIndex, endIndex);

    renderCategoriesTable(categoriesToRender);
    renderPagination(filteredCategories.length);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationElement = document.getElementById('categoriesPagination');
    let paginationHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}" onclick="changePage(${i})">${i}</button> `;
    }

    paginationElement.innerHTML = paginationHTML;
}
function changePage(page) {
    currentPage = page;
    filterAndRenderCategories();
}
// Asegúrate de que estos event listeners estén presentes
document.getElementById('categorySearch').addEventListener('input', filterAndRenderCategories);
document.getElementById('categoryPageSize').addEventListener('change', () => {
    currentPage = 1;
    filterAndRenderCategories();
});

// Llama a loadCategories cuando se carga la página
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
        licenseKey: 'non-commercial-and-evaluation'
    });
}

async function deleteCategory(id) {
    console.log(`Eliminar la categoria: ${id}`);
    
    const result = await showCustomConfirm('¿Estás seguro de que quieres eliminar esta categoría?');

    if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('api/categories.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id: id }),
            });
            const data = await response.json();
            if (data.success) {
                if (typeof loadCategories === 'function') {
                    await loadCategories();
                } else {
                    console.error('loadCategories is not defined');
                }
                showCustomAlert('Categoría eliminada con éxito', 'success');
            } else {
                showCustomAlert('Error al eliminar categoría: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('Error al eliminar categoría', 'error');
        }
    }
}

document.getElementById('addCategoryBtn').addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    modal.show();
});
 
document.getElementById('saveCategoryBtn').addEventListener('click', async function() {
    const categoryName = document.getElementById('categoryName').value;
    if (categoryName) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('api/categories.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: categoryName }),
            });
            const data = await response.json();
            if (data.success) {
                await loadCategories();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
                modal.hide();
                document.getElementById('categoryName').value = '';
                showCustomAlert('Categoría agregada con éxito', 'success');
            } else {
                showCustomAlert('Error al agregar categoría: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('Error al agregar categoría', 'error');
        }
    }
});
// Agregar este evento para limpiar el campo cuando se abre el modal
document.getElementById('addCategoryModal').addEventListener('show.bs.modal', function() {
    document.getElementById('categoryName').value = '';
});

document.getElementById('addCategoryModal').addEventListener('show.bs.modal', function() {
    document.getElementById('categoryName').value = '';
});

// Agregar este nuevo event listener
document.getElementById('categoryName').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        saveCategory();
    }
});

document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);

function saveCategory() {
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
                showCustomAlert('Categoría agregada con éxito', 'success');
                modal.hide();
            } else {
                showAlert('Error al agregar categoría: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error al agregar categoría', 'error');
        });
    }
}

window.deleteCategory = deleteCategory;