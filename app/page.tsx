'use client'

import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../app/firebase/config'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Feather } from 'lucide-react'
import Image from 'next/image'

const books = [
  { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", rating: 4.5, review: "A classic that explores human nature and moral growth through a child's eyes." },
  { id: 2, title: "1984", author: "George Orwell", rating: 4.7, review: "A chilling portrayal of a totalitarian future that remains relevant today." },
  { id: 3, title: "Pride and Prejudice", author: "Jane Austen", rating: 4.3, review: "A witty and romantic tale of love and misunderstanding in Georgian England." },
]

export default function Home() {
  const [user, loading] = useAuthState(auth)
  const [hoveredBook, setHoveredBook] = useState<number | null>(null)

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 font-serif bg-amber-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <svg className="w-8 h-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-semibold text-xl">BookNest</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-black hover:text-gray-600">Home</Link>
              <Link href="#about" className="text-black hover:text-gray-600">About</Link>
              {user ? (
                <Link href="/dashboard" className="text-black hover:text-gray-600">Dashboard</Link>
              ) : (
                <Link href="/login" className="text-black hover:text-gray-600">Login</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div 
        className="py-20 border-b border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <Image src="https://img.freepik.com/premium-photo/minimal-3d-render-open-book-against-pink-background-book-is-pink-has-blank-pages-scene-is-lit-by-soft-pink-light_14117-321517.jpg" alt="Reader" width={500} height={500} />
          </div>
          <div className="md:w-1/2 md:pl-8">
            <h1 className="text-5xl font-serif font-bold mb-4">BookNest</h1>
            <p className="text-xl mb-8">Discover your next favorite book with BookNest</p>
            <Feather className="w-12 h-12 mb-8" />
            {!user && (
              <Link href="/signup" className="bg-black text-white py-2 px-4 rounded-full font-bold hover:bg-gray-800 transition duration-300">Get Started</Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* About Section */}
      <motion.section 
        id="about"
        className="py-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="container mx-auto px-4 border-b border-gray-200 pb-8">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">About BookNest</h2>
          <div className="flex flex-wrap -mx-4 ">
            {[
              { title: "Track Your Reading", description: "Keep a record of books you've read, are currently reading, and want to read in the future.", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { title: "Rate and Review", description: "Share your thoughts on books and see what others think. Discover new favorites through community recommendations.", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
              { title: "Connect with Readers", description: "Join a community of book lovers. Discuss your favorite books and authors with like-minded individuals.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
            ].map((item, index) => (
              <div key={index} className="w-full md:w-1/3 px-4 mb-8 ">
                <motion.div 
                  className="bg-gray-100 rounded-lg shadow-lg p-8 h-full bg-purple-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-12 h-12 text-black mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                  <p>{item.description}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Reviews Section */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">Featured Reviews</h2>
          <div className="flex flex-wrap -mx-4">
            {books.map((book) => (
              <div key={book.id} className="w-full md:w-1/3 px-4 mb-8">
                <motion.div 
                  className="rounded-lg shadow-lg p-8 h-full relative overflow-hidden bg-purple-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onHoverStart={() => setHoveredBook(book.id)}
                  onHoverEnd={() => setHoveredBook(null)}
                >
                  <h3 className="text-xl font-bold mb-2">{book.title}</h3>
                  <p className="text-semibold mb-4">by {book.author}</p>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(book.rating) ? 'text-yellow-600' : 'text-gray-400'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-gray-700">{book.rating.toFixed(1)}</span>
                  </div>
                  <p>{book.review}</p>
                  <AnimatePresence>
                    {hoveredBook === book.id && (
                      <motion.div
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Link href="/signup" className="bg-white text-black py-2 px-4 rounded-full font-bold hover:bg-gray-200">Read More</Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-black bg-amber-100">
        <p>&copy; 2024 BookNest. All rights reserved.</p>
      </footer>
    </div>
  )
}