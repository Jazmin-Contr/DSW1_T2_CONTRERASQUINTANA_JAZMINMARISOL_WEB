const bookList = document.getElementById('book-list');

// Cambia la URL si tu API usa otro puerto o ruta
fetch('https://localhost:7126/api/books')
    .then(response => response.json())
    .then(books => {
        books.forEach(book => {
            const li = document.createElement('li');
            li.textContent = `${book.id} - ${book.description}`;
            bookList.appendChild(li);
        });
    })
    .catch(error => console.error('Error al obtener los libros:', error));
