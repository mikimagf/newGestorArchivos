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

async function getShowCustomAlert() {
    const utils = await import('./utils.js');
    return utils.showCustomAlert;
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
            allCategories = data.categories;
            filterAndRenderCategories();
            console.log('Categories loaded successfully. Total:', allCategories.length);
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
    console.log('Categories filtered and rendered. Total:', filteredCategories.length);
}

function renderPagination(totalItems) {
    console.log('Rendering pagination. Total items:', totalItems);
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) {
        console.error('Elemento de paginación no encontrado');
        return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    console.log('Total pages:', totalPages, 'Current page:', currentPage, 'Items per page:', itemsPerPage);

    if (totalPages <= 1) {
        paginationElement.innerHTML = '';
        return;
    }

    let paginationHTML = '<nav aria-label="Page navigation"><ul class="pagination">';

    // Botón para ir a la primera página
    paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(1)" aria-label="First">
            <span aria-hidden="true">&laquo;&laquo;</span>
        </a>
    </li>`;

    // Botón para página anterior
    paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1})" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    </li>`;

    // Páginas numeradas
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
        </li>`;
    }

    // Botón para página siguiente
    paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1})" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    </li>`;

    // Botón para ir a la última página
    paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${totalPages})" aria-label="Last">
            <span aria-hidden="true">&raquo;&raquo;</span>
        </a>
    </li>`;

    paginationHTML += '</ul></nav>';

    // Contador de registros
    paginationHTML += `<div class="mt-2">Página ${currentPage} de ${totalPages} (${totalItems} registros)</div>`;

    paginationElement.innerHTML = paginationHTML;
    console.log('Pagination HTML rendered');
}

function changePage(page) {
    currentPage = page;
    filterAndRenderCategories();
}

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
                    const editBtn = `<button class="btn btn-primary btn-sm me-2" onclick="editCategory(${categories[row].id})">Editar</button>`;
                    const deleteBtn = `<button class="btn btn-danger btn-sm" onclick="deleteCategory(${categories[row].id})">Eliminar</button>`;
                    td.innerHTML = editBtn + deleteBtn;
                    return td;
                },
                width: 200
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
async function editCategory(id) {
    console.log("el id es",id);
    console.log("todas las categorias",allCategories);
    
    const category = allCategories.find(cat => cat.id == id);
    console.log(category);
    
    if (category) {
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryModalTitle').textContent = 'Editar Categoría';
        document.getElementById('saveCategoryBtn').textContent = 'Guardar Cambios';
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    }
}

async function saveCategory() {
    const categoryId = document.getElementById('categoryId').value;
    const categoryName = document.getElementById('categoryName').value;
    if (categoryName) {
        const token = localStorage.getItem('token');
        const method = categoryId ? 'PUT' : 'POST';
        const body = categoryId ? JSON.stringify({ id: categoryId, name: categoryName }) : JSON.stringify({ name: categoryName });

        try {
            const response = await fetch('api/categories.php', {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: body,
            });
            const data = await response.json();
            if (data.success) {
                await loadCategories();
                const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
                modal.hide();
                document.getElementById('categoryName').value = '';
                document.getElementById('categoryId').value = '';
                showCustomAlert(categoryId ? 'Categoría actualizada con éxito' : 'Categoría agregada con éxito', 'success');
            } else {
                showCustomAlert('Error al ' + (categoryId ? 'actualizar' : 'agregar') + ' categoría: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('Error al ' + (categoryId ? 'actualizar' : 'agregar') + ' categoría', 'error');
        }
    }
}

// function saveCategory() {
//     const categoryName = document.getElementById('categoryName').value;
//     if (categoryName) {
//         const token = localStorage.getItem('token');
//         fetch('api/categories.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify({ name: categoryName }),
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 loadCategories();
//                 document.getElementById('categoryName').value = '';
//                 const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
//                 showCustomAlert('Categoría agregada con éxito', 'success');
//                 modal.hide();
//             } else {
//                 showAlert('Error al agregar categoría: ' + data.message, 'error');
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             showAlert('Error al agregar categoría', 'error');
//         });
//     }
// }



// document.getElementById('addCategoryBtn').addEventListener('click', function() {
//     const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
//     modal.show();
// });
 
document.getElementById('addCategoryBtn').addEventListener('click', function() {
    document.getElementById('categoryModalTitle').textContent = 'Agregar Categoría';
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryName').value = '';
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
});

// document.getElementById('saveCategoryBtn').addEventListener('click', async function() {
//     const categoryName = document.getElementById('categoryName').value;
//     if (categoryName) {
//         const token = localStorage.getItem('token');
//         try {
//             const response = await fetch('api/categories.php', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ name: categoryName }),
//             });
//             const data = await response.json();
//             if (data.success) {
//                 await loadCategories();
//                 const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
//                 modal.hide();
//                 document.getElementById('categoryName').value = '';
//                 showCustomAlert('Categoría agregada con éxito', 'success');
//             } else {
//                 showCustomAlert('Error al agregar categoría: ' + data.message, 'error');
//             }
//         } catch (error) {
//             console.error('Error:', error); 
//             showCustomAlert('Error al agregar categoría', 'error');
//         }
//     }
// });

document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);


document.getElementById('categoryName').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        saveCategory();
    }
});

document.getElementById('categorySearch').addEventListener('input', filterAndRenderCategories);
document.getElementById('categoryPageSize').addEventListener('change', () => {
    currentPage = 1;
    filterAndRenderCategories();
});


window.deleteCategory = deleteCategory;
window.changePage = changePage;
window.editCategory = editCategory;
window.loadCategories=loadCategories;
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    
    // document.getElementById('categorySearch').addEventListener('input', filterAndRenderCategories);
    // document.getElementById('categoryPageSize').addEventListener('change', () => {
    //     currentPage = 1;
    //     filterAndRenderCategories();
    // });
});