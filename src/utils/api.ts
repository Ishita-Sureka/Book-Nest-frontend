import axios from 'axios';
import { auth } from '../../app/firebase/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to attach the authorization token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Register a new user
export const register = async (userData: { name: string; email: string; firebaseUID: string }) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Update login to accept both idToken and firebaseUID
export const login = async (idToken: string, firebaseUID: string) => {
  const response = await api.post('/auth/login', { idToken, firebaseUID });
  return response.data;
};

// Get user profile
export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData: { name?: string; email?: string }) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

// Get all books
export const getBooks = async () => {
  const response = await api.get('/books');
  return response.data;
};

// Add a new book
export const addBook = async (bookData: {
  googleBooksId: string;
  title: string;
  authors: string[];
  description?: string;
  imageUrl?: string;
  readStatus: 'past' | 'current' | 'wishlist';
  userRating?: number;
  userReview?: string;
}) => {
  const response = await api.post('/books', bookData);
  return response.data;
};

// Update an existing book
export const updateBook = async (bookId: string, bookData: {
  readStatus?: 'past' | 'current' | 'wishlist';
  userRating?: number;
  userReview?: string;
}) => {
  const response = await api.put(`/books/${bookId}`, bookData);
  return response.data;
};

// Delete a book
export const deleteBook = async (bookId: string) => {
  console.log('Deleting book with ID:', bookId);
  const response = await api.delete(`/books/${bookId}`);
  return response.data;
};

export const deleteReview = async (bookId: string) => {
  const response = await api.put(`/books/${bookId}`, { userRating: undefined, userReview: undefined });
  return response.data;
};

export default api;
