import { useState, useEffect } from 'react';
import { loanService } from '../services/loanService';
import { bookService } from '../services/bookService';
import type { Loan, Book, CreateLoanDto } from '../types';
import Message from '../components/Message';

const LoansPage = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [booksWithStock, setBooksWithStock] = useState<Book[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });
  const [formData, setFormData] = useState<CreateLoanDto>({
    bookId: 0,
    studentName: '',
  });

  useEffect(() => {
    loadLoans();
    loadBooksWithStock();
  }, []);

  const loadLoans = async () => {
    try {
      const data = await loanService.getActiveLoans();
      setLoans(data);
    } catch {
      showMessage('error', 'Error al cargar préstamos');
    }
  };

  const loadBooksWithStock = async () => {
    try {
      const data = await bookService.getBooksWithStock();
      setBooksWithStock(data);
    } catch {
      console.error('Error al cargar libros');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'bookId' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.bookId === 0) {
      showMessage('error', 'Debe seleccionar un libro');
      return;
    }

    try {
      await loanService.create(formData);
      showMessage('success', 'Préstamo registrado');
      clearForm();
      loadLoans();
      loadBooksWithStock();
    } catch {
      showMessage('error', '❌ El libro no tiene stock disponible');
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm('¿Confirma la devolución?')) return;
    
    try {
      await loanService.returnLoan(id);
      showMessage('success', 'Préstamo devuelto');
      loadLoans();
      loadBooksWithStock();
    } catch {
      showMessage('error', 'Error al devolver');
    }
  };

  const clearForm = () => {
    setFormData({ bookId: 0, studentName: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="page">
      <h1>📋 Gestión de Préstamos</h1>
      
      <Message type={message.type} text={message.text} />

      <div className="form-section">
        <h3>Nuevo Préstamo</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Libro</label>
              <select
                name="bookId"
                value={formData.bookId}
                onChange={handleChange}
                required
              >
                <option value={0}>Seleccione un libro...</option>
                {booksWithStock.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} - {book.author} (Stock: {book.stock})
                  </option>
                ))}
              </select>
              {booksWithStock.length === 0 && (
                <small style={{ color: 'red' }}>No hay libros con stock</small>
              )}
            </div>
            <div className="form-group">
              <label>Nombre del Estudiante</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              Registrar Préstamo
            </button>
            <button type="button" className="btn btn-secondary" onClick={clearForm}>
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Libro</th>
            <th>Estudiante</th>
            <th>Fecha Préstamo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>{loan.bookTitle}</td>
              <td>{loan.studentName}</td>
              <td>{formatDate(loan.loanDate)}</td>
              <td>
                <span className="status-active">{loan.status}</span>
              </td>
              <td>
                <button 
                  className="btn btn-success btn-small" 
                  onClick={() => handleReturn(loan.id)}
                >
                  Devolver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loans.length === 0 && (
        <p className="empty-message">No hay préstamos activos</p>
      )}
    </div>
  );
};

export default LoansPage;