const API_URL = 'http://localhost:5004/api';
let allLoans = [];
let allBooks = [];
let loanToReturn = null;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadLoans();
    loadBooksForSelect();
    setupSearch();
    setupBookSelect();
});

// Cargar préstamos desde la API
async function loadLoans() {
    const tbody = document.getElementById('loansTableBody');
    
    try {
        const response = await fetch(`${API_URL}/loans`);
        
        if (!response.ok) {
            throw new Error('Error al cargar los préstamos');
        }
        
        allLoans = await response.json();
        renderLoans(allLoans);
        updateStats();
        
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Error: ${error.message}</td></tr>`;
    }
}

// Cargar libros para el select
async function loadBooksForSelect() {
    try {
        const response = await fetch(`${API_URL}/books`);
        allBooks = await response.json();
        
        const select = document.getElementById('loanBook');
        select.innerHTML = '<option value="">-- Selecciona un libro --</option>';
        
        allBooks.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} - ${book.author} (Stock: ${book.stock})`;
            option.disabled = book.stock <= 0;
            option.dataset.stock = book.stock;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error al cargar libros:', error);
    }
}

// Configurar evento del select
function setupBookSelect() {
    document.getElementById('loanBook').addEventListener('change', (e) => {
        const option = e.target.options[e.target.selectedIndex];
        const stock = parseInt(option.dataset.stock);
        const info = document.getElementById('stockInfo');
        
        if (isNaN(stock)) {
            info.innerHTML = '';
        } else if (stock <= 0) {
            info.innerHTML = '<span class="text-danger"><i class="bi bi-exclamation-circle"></i> Sin stock disponible</span>';
        } else if (stock <= 3) {
            info.innerHTML = `<span class="text-warning"><i class="bi bi-exclamation-triangle"></i> Stock bajo: ${stock}</span>`;
        } else {
            info.innerHTML = `<span class="text-success"><i class="bi bi-check-circle"></i> ${stock} disponibles</span>`;
        }
    });
}

// Renderizar préstamos en la tabla
function renderLoans(loans) {
    const tbody = document.getElementById('loansTableBody');
    
    if (loans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay préstamos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = loans.map(loan => {
        const isReturned = loan.returnDate !== null;
        
        return `
            <tr>
                <td>${loan.id}</td>
                <td>${loan.bookTitle}</td>
                <td>${loan.studentName}</td>
                <td>${formatDate(loan.loanDate)}</td>
                <td>${isReturned ? formatDate(loan.returnDate) : '-'}</td>
                <td>
                    ${isReturned 
                        ? '<span class="badge badge-returned">Devuelto</span>' 
                        : '<span class="badge badge-active">Activo</span>'}
                </td>
                <td>
                    ${!isReturned 
                        ? `<button class="btn btn-success btn-sm" onclick="openReturnModal(${loan.id}, '${loan.bookTitle.replace(/'/g, "\\'")}', '${loan.studentName.replace(/'/g, "\\'")}')">
                            <i class="bi bi-box-arrow-in-left"></i> Devolver
                           </button>`
                        : '<span class="text-muted"><i class="bi bi-check-circle"></i></span>'}
                </td>
            </tr>
        `;
    }).join('');
}

// Actualizar estadísticas
function updateStats() {
    const total = allLoans.length;
    const returned = allLoans.filter(l => l.returnDate !== null).length;
    const active = total - returned;
    
    document.getElementById('totalLoans').textContent = total;
    document.getElementById('returnedLoans').textContent = returned;
    document.getElementById('activeLoans').textContent = active;
}

// Buscar préstamos
function setupSearch() {
    document.getElementById('searchLoans').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        const filtered = allLoans.filter(loan => 
            loan.bookTitle.toLowerCase().includes(term) ||
            loan.studentName.toLowerCase().includes(term) ||
            loan.id.toString().includes(term)
        );
        
        renderLoans(filtered);
    });
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Abrir modal para crear préstamo
function openCreateLoanModal() {
    document.getElementById('loanForm').reset();
    document.getElementById('stockInfo').innerHTML = '';
    loadBooksForSelect();
}

// Crear préstamo
async function createLoan() {
    const bookId = document.getElementById('loanBook').value;
    const studentName = document.getElementById('loanStudent').value.trim();
    
    // Validar
    if (!bookId) {
        alert('Por favor selecciona un libro');
        return;
    }
    
    if (!studentName) {
        alert('Por favor ingresa el nombre del estudiante');
        return;
    }
    
    // Verificar stock
    const book = allBooks.find(b => b.id === parseInt(bookId));
    if (book && book.stock <= 0) {
        showErrorModal(`No hay stock disponible para "${book.title}"`);
        return;
    }
    
    // Datos según CreateLoanDto
    const data = {
        bookId: parseInt(bookId),
        studentName: studentName
    };
    
    try {
        const response = await fetch(`${API_URL}/loans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear préstamo');
        }
        
        // Cerrar modal y recargar
        bootstrap.Modal.getInstance(document.getElementById('loanModal')).hide();
        loadLoans();
        loadBooksForSelect();
        
        showAlert('Préstamo registrado correctamente', 'success');
        
    } catch (error) {
        if (error.message.toLowerCase().includes('stock')) {
            showErrorModal(error.message);
        } else {
            alert('Error: ' + error.message);
        }
    }
}

// Abrir modal para devolver
function openReturnModal(id, bookTitle, studentName) {
    loanToReturn = id;
    document.getElementById('returnLoanInfo').innerHTML = `
        <strong>"${bookTitle}"</strong><br>
        <small>Estudiante: ${studentName}</small>
    `;
    
    new bootstrap.Modal(document.getElementById('returnModal')).show();
    
    document.getElementById('confirmReturnBtn').onclick = returnLoan;
}

// Devolver préstamo
async function returnLoan() {
    if (!loanToReturn) return;
    
    try {
        // PUT /api/loans/{id}/return
        const response = await fetch(`${API_URL}/loans/${loanToReturn}/return`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al devolver');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('returnModal')).hide();
        loanToReturn = null;
        loadLoans();
        loadBooksForSelect();
        
        showAlert('Préstamo devuelto correctamente', 'success');
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Mostrar modal de error
function showErrorModal(message) {
    document.getElementById('errorMessage').textContent = message;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

// Mostrar alerta
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-floating alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 3000);
}