// Book Types
export interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    stock: number;
    createdAt: string;
    hasStock: boolean;
}

export interface CreateBookDto {
    title: string;
    author: string;
    isbn: string;
    stock: number;
}

export interface UpdateBookDto {
    title: string;
    author: string;
    isbn: string;
    stock: number;
}

// Loan Types
export interface Loan {
    id: number;
    bookId: number;
    bookTitle: string;
    bookISBN: string;
    studentName: string;
    loanDate: string;
    returnDate: string | null;
    status: string;
    createdAt: string;
}

export interface CreateLoanDto {
    bookId: number;
    studentName: string;
}