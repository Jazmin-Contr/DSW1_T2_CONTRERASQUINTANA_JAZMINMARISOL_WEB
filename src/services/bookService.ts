import api from './api';
import type { Book, CreateBookDto, UpdateBookDto } from '../types';

export const bookService = {
  getAll: async (): Promise<Book[]> => {
    const response = await api.get('/Books');
    return response.data;
  },

  getById: async (id: number): Promise<Book> => {
    const response = await api.get(`/Books/${id}`);
    return response.data;
  },

  getBooksWithStock: async (): Promise<Book[]> => {
    const response = await api.get('/Books/with-stock');
    return response.data;
  },

  create: async (data: CreateBookDto): Promise<Book> => {
    const response = await api.post('/Books', data);
    return response.data;
  },

  update: async (id: number, data: UpdateBookDto): Promise<Book> => {
    const response = await api.put(`/Books/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Books/${id}`);
  },
};