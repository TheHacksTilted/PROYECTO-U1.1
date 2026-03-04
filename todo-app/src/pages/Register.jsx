import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { UserPlus, Moon, Sun } from 'lucide-react'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const [darkMode, setDarkMode] = useState(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    )

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) {
            let msg = error.message;
            if (msg === 'User already registered') msg = 'Este correo ya está registrado.';
            if (msg.includes('Password should be at least')) msg = 'La contraseña debe tener al menos 6 caracteres.';
            if (msg.includes('Email rate limit exceeded')) msg = 'Límite de correos excedido, intenta nuevamente más tarde.';
            setError(msg)
        } else {
            setSuccess(true)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Dark Mode Toggle */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="absolute top-6 right-6 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
            >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-colors duration-300">
                <div className="flex justify-center mb-8">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full">
                        <UserPlus className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    Crea tu cuenta
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
                    Comienza a organizar tus tareas hoy
                </p>

                {success ? (
                    <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-xl text-center">
                        <p className="text-green-800 dark:text-green-300 mb-4 font-medium">¡Registro exitoso!</p>
                        <p className="text-sm text-green-700 dark:text-green-400 mb-6">Revisa tu correo electrónico para confirmar tu cuenta.</p>
                        <Link to="/login" className="inline-block py-2 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            Ir a Iniciar Sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="tu@correo.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Cargando...' : 'Registrarse'}
                        </button>

                        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                Inicia sesión
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
