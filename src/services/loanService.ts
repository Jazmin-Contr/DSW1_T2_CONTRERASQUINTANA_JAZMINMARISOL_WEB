import api from './api';
import type { Loan, CreateLoanDto } from '../types';

export const loanService = {
  getAll: async (): Promise<Loan[]> => {
    const response = await api.get('/Loans');
    return response.data;
  },

  getActiveLoans: async (): Promise<Loan[]> => {
    const response = await api.get('/Loans/active');
    return response.data;
  },

  getById: async (id: number): Promise<Loan> => {
    const response = await api.get(`/Loans/${id}`);
    return response.data;
  },

  create: async (data: CreateLoanDto): Promise<Loan> => {
    const response = await api.post('/Loans', data);
    return response.data;
  },

  returnLoan: async (id: number): Promise<Loan> => {
    const response = await api.put(`/Loans/${id}/return`);
    return response.data;
  },
};