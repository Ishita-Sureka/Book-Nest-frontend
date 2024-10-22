'use client'

import { useState } from 'react'
import { useCreateUserWithEmailAndPassword, useSignInWithGoogle } from 'react-firebase-hooks/auth'
import { auth } from '../firebase/config'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { register } from '../../src/utils/api'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [signInWithGoogle, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth)


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await createUserWithEmailAndPassword(email, password)
      if (res) {
        await register({
          name,
          email,
          firebaseUID: res.user.uid,
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const res = await signInWithGoogle()
      if (res) {
        await register({
          name: res.user.displayName || '',
          email: res.user.email || '',
          firebaseUID: res.user.uid,
        })
        router.push('/dashboard')
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex items-center justify-center p-4 bg-cover bg-center bg-[url('https://img.freepik.com/free-vector/beige-background-vector-with-arch-frame_53876-111256.jpg?size=626&ext=jpg&ga=GA1.1.1819120589.1727481600&semt=ais_hybrid')] h-screen w-full">
      <motion.div 
        className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full flex"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to BookNest</h2>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-red-200 focus:ring-1 focus:ring-red-200 text-black"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-red-200 focus:ring-1 focus:ring-red-200 text-black"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-red-200 focus:ring-1 focus:ring-red-200 text-black"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-400 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={loading}
              >
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
            </div>
          </form>
          <div className="mt-6">
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={googleLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              {googleLoading ? 'Signing up...' : 'Continue with Google'}
            </button>
          </div>
          {(error || googleError) && (
            <p className="mt-4 text-center text-sm text-red-700">
              {error?.message || googleError?.message}
            </p>
          )}
          <p className="mt-10 text-center text-sm  text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold leading-6 text-red-400 hover:text-red-500">
              Log in
            </Link>
          </p>
        </div>
        <div className="hidden md:block w-1/2 bg-cover bg-center bg-[url('https://www.charlenechronicles.com/wp-content/uploads/2020/12/Book_Library_zoom_backgrounds_charlene_chronicles_32-1024x576.png?height=600&width=400')]">
        </div>
      </motion.div>
    </div>
  )
}