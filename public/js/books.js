// =================================================================
// 1. CONFIGURACIÓN INICIAL
// =================================================================
const API_URL = 'http://localhost:5004/api/Books'; 

let currentBookId = null;
let allBooks = [];

// Variables para elementos del DOM (se inicializan después de que carga el DOM)
let booksTableBody, totalBooksEl, booksWithStockEl, booksNoStockEl;
let searchInput, bookModal, bookForm, bookModalTitle, btnSaveBook;
let deleteModal, deleteBookTitle, confirmDeleteBtn;

// =================================================================
// 2. INICIALIZACIÓN
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar referencias a elementos del DOM
    booksTableBody = document.getElementById('booksTableBody');
    totalBooksEl = document.getElementById('totalBooks');
    booksWithStockEl = document.getElementById('booksWithStock');
    booksNoStockEl = document.getElementById('booksNoStock');
    searchInput = document.getElementById('searchBooks');
    
    // Modales
    const bookModalElement = document.getElementById('bookModal');
    bookModal = new bootstrap.Modal(bookModalElement);
    bookForm = document.getElementById('bookForm');
    bookModalTitle = document.getElementById('bookModalTitle');
    btnSaveBook = document.getElementById('btnSaveBook');
    
    const deleteModalElement = document.getElementById('deleteModal');
    deleteModal = new bootstrap.Modal(deleteModalElement);
    deleteBookTitle = document.getElementById('deleteBookTitle');
    confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            loadBooks(e.target.value.trim()); 
        });
    }
    
    if (btnSaveBook) {
        btnSaveBook.addEventListener('click', saveBook);
    }
    
    // Cargar libros
    loadBooks();
});

// =================================================================
// 3. FUNCIONES DE UI (MODALES)
// =================================================================

/**
 * Abre el modal en modo Creación.
 */
function openCreateBookModal() {
    bookModalTitle.textContent = "Nuevo Libro";
    bookForm.reset();
    currentBookId = null;
    bookForm.classList.remove('was-validated');
    bookModal.show();
}

/**
 * Abre el modal en modo Edición.
 */
function openEditBookModal(book) {
    bookModalTitle.textContent = "Editar Libro";
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookIsbn').value = book.isbn;
    document.getElementById('bookStock').value = book.stock;
    currentBookId = book.id;
    bookForm.classList.remove('was-validated');
    bookModal.show();
}

/**
 * Muestra el modal de confirmación de eliminación.
 */
function confirmDeleteBook(id, title) {
    deleteBookTitle.textContent = title;
    confirmDeleteBtn.onclick = () => deleteBook(id);
    deleteModal.show();
}

// =================================================================
// 4. CONEXIÓN A LA API (CRUD)
// =================================================================

/**
 * Carga y renderiza la lista de libros.
 */
async function loadBooks(searchTerm = '') {
    try {
        let url = searchTerm 
            ? `${API_URL}/search?term=${encodeURIComponent(searchTerm)}`
            : API_URL;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const books = await response.json();
        allBooks = books;
        
        renderBooks(books);
        
        // Actualizar estadísticas solo si no hay búsqueda
        if (!searchTerm) {
            updateStats(books);
        }
        
    } catch (err) {
        console.error("Error al cargar libros:", err);
        if (booksTableBody) {
            booksTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-danger">
                        Error de conexión con el backend. Asegúrate que la API esté corriendo en el puerto 5004.
                    </td>
                </tr>`;
        }
        if (totalBooksEl) totalBooksEl.textContent = 'N/A';
        if (booksWithStockEl) booksWithStockEl.textContent = 'N/A';
        if (booksNoStockEl) booksNoStockEl.textContent = 'N/A';
    }
}

/**
 * Renderiza los libros en la tabla.
 */
function renderBooks(books) {
    if (!booksTableBody) return;
    
    if (books.length === 0) {
        booksTableBody.innerHTML = '<tr><td colspan="6">No hay libros registrados</td></tr>';
        return;
    }
    
    booksTableBody.innerHTML = books.map(book => {
        const safeTitle = book.title.replace(/'/g, "\\'");
        const bookJson = JSON.stringify(book).replace(/"/g, '&quot;');
        
        return `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td>${book.stock}</td>
                <td>
                    <button class="btn btn-sm btn-success me-2" onclick='openEditBookModal(${JSON.stringify(book)})'>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteBook(${book.id}, '${safeTitle}')">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Actualiza las estadísticas.
 */
function updateStats(books) {
    if (totalBooksEl) totalBooksEl.textContent = books.length;
    if (booksWithStockEl) booksWithStockEl.textContent = books.filter(b => b.stock > 0).length;
    if (booksNoStockEl) booksNoStockEl.textContent = books.filter(b => b.stock === 0).length;
}

/**
 * Guardar libro (crear o actualizar).
 */
async function saveBook() {
    // Validación
    if (!bookForm.checkValidity()) {
        bookForm.classList.add('was-validated');
        return;
    }
    
    const dto = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        isbn: document.getElementById('bookIsbn').value.trim(),
        stock: Number(document.getElementById('bookStock').value)
    };

    try {
        let response;
        
        if (currentBookId) {
            // UPDATE (PUT)
            response = await fetch(`${API_URL}/${currentBookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });
        } else {
            // CREATE (POST)
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            alert(`Error al guardar: ${error.message || 'Ocurrió un error desconocido.'}`);
            return;
        }

        // Éxito
        bookModal.hide();
        bookForm.reset();
        bookForm.classList.remove('was-validated');
        currentBookId = null;
        loadBooks();
        
    } catch (err) {
        console.error(err);
        alert('Error de red al intentar guardar el libro.');
    }
}

/**
 * Elimina un libro.
 */
async function deleteBook(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { 
            method: 'DELETE' 
        });
        
        if (!response.ok) {
            const error = await response.json();
            alert(`No se pudo eliminar: ${error.message || 'Error desconocido'}`);
            return;
        }
        
        deleteModal.hide();
        loadBooks();
        
    } catch (err) {
        console.error(err);
        alert('Error de red al intentar eliminar el libro.');
    }
}
