import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Completing sign in...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase client automatically handles the hash fragment
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (data.session) {
          setStatus('success')
          setMessage('Signed in successfully!')
          
          // Redirect after short delay
          setTimeout(() => {
            const from = (location.state as any)?.from?.pathname || '/dashboard'
            navigate(from, { replace: true })
          }, 1000)
        } else {
          // Check if there's an error in the URL
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const error = hashParams.get('error')
          const errorDescription = hashParams.get('error_description')
          
          if (error) {
            throw new Error(errorDescription || error)
          }
          
          throw new Error('No session found')
        }
      } catch (err: any) {
        setStatus('error')
        setMessage(err.message || 'Authentication failed. Please try again.')
      }
    }

    handleCallback()
  }, [navigate, location])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--page)] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-full mb-6",
          status === 'loading' && "bg-[var(--acid)]/10 border border-[var(--acid)]/30",
          status === 'success' && "bg-[var(--acid)]/10 border border-[var(--acid)]/30",
          status === 'error' && "bg-[var(--danger)]/10 border border-[var(--danger)]/30"
        )}>
          {status === 'loading' && <Loader2 className="w-8 h-8 text-[var(--acid)] animate-spin" />}
          {status === 'success' && <CheckCircle2 className="w-8 h-8 text-[var(--acid)]" />}
          {status === 'error' && <AlertCircle className="w-8 h-8 text-[var(--danger)]" />}
        </div>

        <h1 className="text-xl font-bold text-[var(--ink)] font-[var(--sans)] mb-2">
          {status === 'loading' && 'Completing Sign In...'}
          {status === 'success' && 'Welcome Back!'}
          {status === 'error' && 'Sign In Failed'}
        </h1>

        <p className="text-[var(--muted)] font-[var(--sans)] mb-6">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--acid)] text-[#091006] hover:bg-[#d1ff99] transition-colors font-bold text-sm font-[var(--sans)]"
          >
            <ArrowRight className="w-4 h-4" />
            Try Again
          </button>
        )}
      </motion.div>
    </div>
  )
}