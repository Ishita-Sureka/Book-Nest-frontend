'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useAuthState } from 'react-firebase-hooks/auth'
import Link from 'next/link'
import { X, Check, Trash2 } from 'lucide-react'
import { getBooks, addBook, updateBook, deleteBook, getProfile } from '../../src/utils/api'
import Image from 'next/image'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY

interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    imageLinks?: {
      thumbnail: string
    }
    description?: string
  }
}

interface Book {
  _id: string; // Updated to use _id
  googleBooksId: string
  title: string
  authors: string[]
  imageUrl?: string
  description?: string
  readStatus: 'past' | 'current' | 'wishlist'
  userRating?: number
  userReview?: string
}

export default function Dashboard() {
  const [user, loading] = useAuthState(auth)
  const [googleBooks, setGoogleBooks] = useState<GoogleBook[]>([])
  const [userBooks, setUserBooks] = useState<Book[]>([])
  const [userName, setUserName] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('Home')
  const [expandedBook, setExpandedBook] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [activeCatalogSection, setActiveCatalogSection] = useState('wishlist')
  const [currentReview, setCurrentReview] = useState('')
  const [currentRating, setCurrentRating] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
      } else {
        fetchUserProfile()
        fetchUserBooks()
        fetchGoogleBooks()
      }
    }
  }, [user, loading, router])

  const fetchUserProfile = async () => {
    try {
      const profile = await getProfile()
      setUserName(profile.name)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUserBooks = async () => {
    try {
      const books = await getBooks()
      console.log('Fetched user books:', books);
      setUserBooks(books)
    } catch (error) {
      console.error('Error fetching user books:', error)
    }
  }

  const fetchGoogleBooks = async (query: string = '') => {
    const url = query
      ? `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${API_KEY}`
      : `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=9&key=${API_KEY}`

    try {
      const response = await fetch(url)
      const data = await response.json()
      setGoogleBooks(data.items || [])
    } catch (error) { 
      console.error('Error fetching books:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGoogleBooks(searchQuery)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const addToUserBooks = async (book: GoogleBook) => {
    // Check if the book is already in the user's collection
    const isBookAlreadyAdded = userBooks.some(userBook => userBook.googleBooksId === book.id)
    if (isBookAlreadyAdded) {
      alert('This book is already in your collection.')
      return
    }

    try {
      const newBook = await addBook({
        googleBooksId: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        description: book.volumeInfo.description,
        imageUrl: book.volumeInfo.imageLinks?.thumbnail,
        readStatus: 'wishlist',
      })
      setUserBooks([...userBooks, newBook]) // Ensure newBook is of type Book
    } catch (error) {
      console.error('Error adding book:', error)
    }
  }

  const changeReadStatus = async (bookId: string, newStatus: 'past' | 'current' | 'wishlist') => {
    console.log('Changing read status for bookId:', bookId); // Debugging log
    if (!bookId) {
      console.error('Book ID is undefined. Cannot change read status.');
      return;
    }
    try {
      const updatedBook = await updateBook(bookId, { readStatus: newStatus });
      setUserBooks(userBooks.map(book => book._id === bookId ? updatedBook : book)); // Use _id
    } catch (error) {
      console.error('Error changing read status:', error);
    }
  };
  

  const rateBook = async (bookId: string, rating: number) => {
    try {
      const updatedBook = await updateBook(bookId, { userRating: rating })
      setUserBooks(userBooks.map(book => book._id === bookId ? updatedBook : book)); // Use _id
    } catch (error) {
      console.error('Error rating book:', error)
    }
  }

  const reviewBook = async (bookId: string, review: string) => {
    try {
      const updatedBook = await updateBook(bookId, { userReview: review })
      setUserBooks(userBooks.map(book => book._id === bookId ? updatedBook : book)); // Use _id
      setCurrentReview('')
    } catch (error) {
      console.error('Error reviewing book:', error)
    }
  }

  const deleteUserBook = async (bookId: string) => {
    try {
      await deleteBook(bookId)
      setUserBooks(userBooks.filter(book => book._id !== bookId)); // Use _id
    } catch (error) {
      console.error('Error deleting book:', error)
    }
  }

  const deleteReview = async (bookId: string) => {
    try {
      const updatedBook = await updateBook(bookId, { userRating: undefined, userReview: undefined })
      setUserBooks(userBooks.map(book => book._id === bookId ? updatedBook : book)); // Use _id
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white text-black font-serif">
      {/* Navbar */}
      <nav className="border-b-2 border-gray-800 bg-amber-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-7">
              <div>
                <Link href="/" className="flex items-center py-4 px-2">
                  <svg className="w-6 h-6 mr-2 stroke-gray-800" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5  16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-semibold text-gray-800 text-lg">BookNest</span>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              {['Home', 'Book Catalog', 'Reviews'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item)}
                  className={`text-gray-800 hover:text-red-500 ${activeSection === item ? 'font-bold' : ''}`}
                >
                  {item}
                </button>
              ))}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-500 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>{userName || 'User' }</span>
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    >
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-red-400 hover:text-white w-full text-left"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeSection === 'Home' && (
          <>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for books..."
                  className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-r-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Book Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {googleBooks.map((book) => (
                <motion.div
                  key={book.id}
                  className=" rounded-lg shadow-md overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setExpandedBook(book.id)}
                >
                  <Image
                    src={book.volumeInfo.imageLinks?.thumbnail || '/login-image.png'}
                    alt={book.volumeInfo.title}
                    // ?height=200&width=150
                    width={1500} height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="font-bold text-xl mb-2 text-gray-900">{book.volumeInfo.title}</h2>
                    <p className="text-gray-800 mb-2">
                      {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Expanded Book Card */}
            <AnimatePresence>
              {expandedBook && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => setExpandedBook(null)}
                >
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setExpandedBook(null)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                    {googleBooks.find(book => book.id === expandedBook) && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">
                          {googleBooks.find(book => book.id === expandedBook)?.volumeInfo.title}
                        </h2>
                        <p className="text-gray-600 mb-4">
                          {googleBooks.find(book => book.id === expandedBook)?.volumeInfo.authors?.join(', ')}
                        </p>
                        <p className="text-gray-700 mb-4">
                          {googleBooks.find(book => book.id === expandedBook)?.volumeInfo.description}
                        </p>
                        
                        {/* Rating and review section */}
                        <div className="flex items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => rateBook(expandedBook, i + 1)}
                              className={`w-6 h-6 ${
                                i < (userBooks.find(b => b.googleBooksId === expandedBook)?.userRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              <svg
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>

                        {/* Review form */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            reviewBook(expandedBook, currentReview);
                          }}
                        >
                          <textarea
                            value={currentReview}
                            onChange={(e) => setCurrentReview(e.target.value)}
                            placeholder="Write your review..."  
                            className="w-full p-2 border rounded mb-4"
                            rows={4}
                          />
                          <button
                            type="submit"
                            className="w-full bg-red-400 text-white px-4 py-2 rounded mb-4"
                          >
                            Submit Review
                          </button>
                        </form>

                        {/* Add to cart button */}
                        <button
                          onClick={() => {
                            const book = googleBooks.find(book => book.id === expandedBook)!;
                            addToUserBooks(book);
                            if (currentRating > 0 || currentReview) {
                              // Use userBooks to find the correct _id
                              const bookInUserBooks = userBooks.find(userBook => userBook.googleBooksId === book.id);
                              if (bookInUserBooks) {
                                rateBook(bookInUserBooks._id, currentRating); // Use _id
                                reviewBook(bookInUserBooks._id, currentReview); // Use _id
                              }
                            }
                            setExpandedBook(null);
                            setCurrentRating(0);
                            setCurrentReview('');
                          }}
                          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                        >
                          <Check size={20} className="mr-2" />
                          Add to My Books
                        </button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {activeSection === 'Book Catalog' && (
          <div className="space-y-8">
            <div className="flex justify-center space-x-4 mb-8">
              {['past', 'current', 'wishlist'].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveCatalogSection(status)}
                  className={`px-4 py-2 rounded-full ${
                    activeCatalogSection === status
                      ? 'bg-purple-400 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status === 'past' ? 'Past Reads' : status === 'current' ? 'Currently Reading' : 'Wishlist'}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {userBooks
                .filter((book) => book.readStatus === activeCatalogSection)
                .map((book) => (
                  <motion.div
                    key={book._id} // Use _id instead of id
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={book.imageUrl || '/login-image.png'}
                      alt={book.title}
                      width={1500} height={2000}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-xl mb-2 text-gray-800">{book.title}</h3>
                      <p className="text-gray-600 mb-2">
                        {book.authors ? book.authors.join(', ') : 'Unknown Author'}
                      </p>
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => changeReadStatus(book._id, 'past')} // Use _id
                          className={`px-2 py-1 rounded text-sm ${book.readStatus === 'past' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Past
                        </button>
                        <button
                          onClick={() => changeReadStatus(book._id, 'current')} // Use _id
                          className={`px-2 py-1 rounded text-sm ${book.readStatus === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Current
                        </button>
                        <button
                          onClick={() => changeReadStatus(book._id, 'wishlist')} // Use _id
                          className={`px-2 py-1 rounded text-sm ${book.readStatus === 'wishlist' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          Wishlist
                        </button>
                      </div>
                      <button
                        onClick={() => deleteUserBook(book._id)} // Use _id
                        className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <Trash2 size={20} className="mr-2" />
                        Remove from Catalog
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {activeSection === 'Reviews' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-4">Your Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {userBooks
                .filter((book) => book.userRating || book.userReview)
                .map((book) => (
                  <div key={book._id} className="bg-transparent rounded-lg shadow-md p-6"> {/* Use _id */}
                    <h3 className="font-bold text-xl mb-2 text-gray-900">{book.title}</h3>
                    <p className="text-gray-800 mb-2">
                      {book.authors ? book.authors.join(', ') : 'Unknown Author'}
                    </p>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < (book.userRating || 0) ? 'text-yellow-400' : 'text-gray-500'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-gray-800">{book.userRating} stars</span>
                    </div>
                    {book.userReview && (
                      <p className="text-gray-900 mt-2">{book.userReview}</p>
                    )}
                    <button
                      onClick={() => deleteReview(book._id)} // Use _id
                      className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={20} className="mr-2" />
                      Delete Review
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-b-2 border-gray-800 py-4 mt-8 text-center bg-amber-100">
        <p>&copy; 2024 BookNest. All rights reserved.</p>
      </footer>
    </div>
  )
}
