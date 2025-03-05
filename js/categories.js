import { showCustomAlerta, showCustomConfirm } from './utils.js';
import { updateCategoryFilter } from './fileManagement.js';


// @ts-ignore
async function getAlertFunctions() {
    const utils = await import('./utils.js');
    return {
        showAlert: utils.showAlert,
        showCustomAlerta: utils.showCustomAlerta
    };
}

let categoriesTable;
let allCategories = [];
let currentPage = 1;
let itemsPerPage = 10;

async function getShowCustomAlerta() {
    const utils = await import('./utils.js');
    return utils.showCustomAlerta;
}
async function cargarCategorias() {
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
            filtrarYRenderizarCategorias();
            updateCategoryFilter(allCategories);
            console.log('Categories loaded successfully. Total:', allCategories.length);
        } else {
            const showCustomAlerta = await getShowCustomAlerta();
            showCustomAlerta('Error al cargar categorías: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        const showCustomAlerta = await getShowCustomAlerta();
        showCustomAlerta('Error al cargar categorías', 'error');
    }
}

function filtrarYRenderizarCategorias() {
    // @ts-ignore
    const searchTerm = document.getElementById('categorySearch').value.toLowerCase();
    // @ts-ignore
    itemsPerPage = parseInt(document.getElementById('categoryPageSize').value);

    const filteredCategories = allCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm)
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const categoriesToRender = filteredCategories.slice(startIndex, endIndex);

    renderizarTabladeCategorias(categoriesToRender);
    rendererizarPaginacion(filteredCategories.length);
    console.log('Categories filtered and rendered. Total:', filteredCategories.length);
}

function rendererizarPaginacion(totalItems) {
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
        <a class="page-link" href="#" onclick="canbiodePagina(1)" aria-label="First">
            <span>&laquo;&laquo;</span>
        </a>
    </li>`;

    // Botón para página anterior
    paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="canbiodePagina(${currentPage - 1})" aria-label="Previous">
            <span>&laquo;</span>
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
            <a class="page-link" href="#" onclick="canbiodePagina(${i})">${i}</a>
        </li>`;
    }

    // Botón para página siguiente
    paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="canbiodePagina(${currentPage + 1})" aria-label="Next">
            <span >&raquo;</span>
        </a>
    </li>`;

    // Botón para ir a la última página
    paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="canbiodePagina(${totalPages})" aria-label="Last">
            <span>&raquo;&raquo;</span>
        </a>
    </li>`;

    paginationHTML += '</ul></nav>';

    // Contador de registros
    paginationHTML += `<div class="mt-2">Página ${currentPage} de ${totalPages} (${totalItems} registros)</div>`;

    paginationElement.innerHTML = paginationHTML;
    console.log('Pagination HTML rendered');
}

function canbiodePagina(page) {
    currentPage = page;
    filtrarYRenderizarCategorias();
}

function renderizarTabladeCategorias(categories) {
    const container = document.getElementById('categoriesTable');
    if (categoriesTable) {
        categoriesTable.destroy();
    }
    // @ts-ignore
    categoriesTable = new Handsontable(container, {
        data: categories,
        columns: [
            { data: 'id', title: 'ID', readOnly: true, width: 50 },
            { data: 'name', title: 'Nombre', width: 200 },
            {
                data: 'actions',
                title: 'Acciones',
                // @ts-ignore
                renderer: function (instance, td, row, col, prop, value, cellProperties) {
                    const editBtn = `<button class="btn btn-primary btn-sm me-2" onclick="editarCategoria(${categories[row].id})">Editar</button>`;
                    const deleteBtn = `<button class="btn btn-danger btn-sm" onclick="eliminarCategoria(${categories[row].id})">Eliminar</button>`;
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

async function eliminarCategoria(id) {
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
                if (typeof cargarCategorias === 'function') {
                    await cargarCategorias();
                } else {
                    console.error('cargarCategorias is not defined');
                }
                showCustomAlerta('Categoría eliminada con éxito', 'success');
            } else {
                showCustomAlerta('Error al eliminar categoría: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showCustomAlerta('Error al eliminar categoría', 'error');
        }
    }
}
async function editarCategoria(id) {
    console.log("el id es", id);
    console.log("todas las categorias", allCategories);

    const category = allCategories.find(cat => cat.id == id);
    console.log(category);

    if (category) {
        // @ts-ignore
        document.getElementById('categoryId').value = category.id;
        // @ts-ignore
        document.getElementById('categoryName').value = category.name;
        // @ts-ignore
        document.getElementById('categoryModalTitle').textContent = 'Editar Categoría';
        // @ts-ignore
        document.getElementById('saveCategoryBtn').textContent = 'Guardar Cambios';
        // @ts-ignore
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
    }
}

async function guardarCategoria() {
    const form = document.getElementById('categoryForm');
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const categoryId = document.getElementById('categoryId').value;
    const categoryName = document.getElementById('categoryName').value;
    
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
            await cargarCategorias();
            const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
            modal.hide();
            document.getElementById('categoryName').value = '';
            document.getElementById('categoryId').value = '';
            form.classList.remove('was-validated');
            
            showCustomAlerta(categoryId ? 'Categoría actualizada con éxito' : 'Categoría agregada con éxito', 'success');
        } else {
            showCustomAlerta('Error al ' + (categoryId ? 'actualizar' : 'agregar') + ' categoría: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showCustomAlerta('Error al ' + (categoryId ? 'actualizar' : 'agregar') + ' categoría', 'error');
    }
}

// @ts-ignore
document.getElementById('addCategoryBtn').addEventListener('click', function () {
    // @ts-ignore
    document.getElementById('categoryModalTitle').textContent = 'Agregar Categoría';
    // @ts-ignore
    document.getElementById('categoryId').value = '';
    // @ts-ignore
    document.getElementById('categoryName').value = '';
    // @ts-ignore
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
});

// @ts-ignore
// document.getElementById('saveCategoryBtn').addEventListener('click', guardarCategoria);


// @ts-ignore
// document.getElementById('categoryName').addEventListener('keypress', function(event) {
//     if (event.key === 'Enter') {
//         event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
//         guardarCategoria();
//     }
// });
document.addEventListener('keypress', function (event) {
    if (event.target && event.target.id === 'categoryName' && event.key === 'Enter') {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        guardarCategoria();
    }
});

// @ts-ignore
document.getElementById('categorySearch').addEventListener('input', filtrarYRenderizarCategorias);

// @ts-ignore
document.getElementById('categoryPageSize').addEventListener('change', () => {
    currentPage = 1;
    filtrarYRenderizarCategorias();
});


document.addEventListener('click', function (event) {
    if (event.target && event.target.id === 'saveCategoryBtn') {
        guardarCategoria();
    }
    //  else if (event.target && event.target.id === 'addCategoryBtn') {
    //     // Código para mostrar el modal de categoría
    //     const modalElement = document.getElementById('categoryModal');
        
    //     // Reiniciar el formulario
    //     document.getElementById('categoryModalTitle').textContent = 'Agregar Categoríaa';
    //     document.getElementById('categoryId').value = '';
    //     document.getElementById('categoryName').value = '';
        
    //     // Usar el método de Bootstrap para mostrar el modal
    //     const modal = new bootstrap.Modal(modalElement);
    //     modal.show();
    // }
});


// @ts-ignore
window.eliminarCategoria = eliminarCategoria;
// @ts-ignore
window.canbiodePagina = canbiodePagina;
// @ts-ignore
window.editarCategoria = editarCategoria;
// @ts-ignore
window.cargarCategorias = cargarCategorias;
document.addEventListener('DOMContentLoaded', function () {
    cargarCategorias();

    // document.getElementById('categorySearch').addEventListener('input', filtrarYRenderizarCategorias);
    // document.getElementById('categoryPageSize').addEventListener('change', () => {
    //     currentPage = 1;
    //     filtrarYRenderizarCategorias();
    // });

    
});