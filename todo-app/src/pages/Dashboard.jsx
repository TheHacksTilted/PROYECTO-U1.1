import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { LogOut, Plus, Search, CheckCircle2, Circle, MoreVertical, Edit2, Trash2, Moon, Sun, LayoutDashboard, ListTodo } from 'lucide-react'

export default function Dashboard({ session }) {
    const [tasks, setTasks] = useState([])
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDesc, setNewTaskDesc] = useState('')

    const [filter, setFilter] = useState('all') // 'all', 'active', 'completed'
    const [search, setSearch] = useState('')

    const [editingId, setEditingId] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [editDesc, setEditDesc] = useState('')

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

    useEffect(() => {
        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (!error && data) setTasks(data)
        }

        fetchTasks()

        // Realtime subscription
        const channel = supabase
            .channel('tasks_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${session.user.id}` }, payload => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [payload.new, ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t))
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [session.user.id])

    const handleAddTask = async (e) => {
        e.preventDefault()
        if (!newTaskTitle.trim()) return

        const { error } = await supabase.from('tasks').insert([
            { title: newTaskTitle, description: newTaskDesc, user_id: session.user.id }
        ])

        if (!error) {
            setNewTaskTitle('')
            setNewTaskDesc('')
            // optimistic addition is handled by realtime if configured correctly, but we can also just let realtime do it.
        }
    }

    const toggleComplete = async (task) => {
        await supabase
            .from('tasks')
            .update({ completed: !task.completed })
            .eq('id', task.id)
    }

    const handleDelete = async (id) => {
        // Actualización optimista para que la interfaz se sienta instantánea
        setTasks(prev => prev.filter(t => t.id !== id))
        await supabase.from('tasks').delete().eq('id', id)
    }

    const handleEditSave = async (id) => {
        await supabase
            .from('tasks')
            .update({ title: editTitle, description: editDesc })
            .eq('id', id)
        setEditingId(null)
    }

    const startEditing = (task) => {
        setEditingId(task.id)
        setEditTitle(task.title)
        setEditDesc(task.description || '')
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    // Stats
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const pendingTasks = totalTasks - completedTasks

    // Filtered
    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === 'all' ||
            (filter === 'completed' && t.completed) ||
            (filter === 'active' && !t.completed)
        return matchesSearch && matchesFilter
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 dark:text-white">ProTask</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
                                <LogOut className="w-5 h-5" />
                                <span className="hidden sm:block">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de tareas</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalTasks}</p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                            <ListTodo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completadas</p>
                            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedTasks}</p>
                        </div>
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingTasks}</p>
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full">
                            <Circle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Add Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24 transition-colors">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nueva Tarea</h3>
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        required
                                        value={newTaskTitle}
                                        onChange={e => setNewTaskTitle(e.target.value)}
                                        placeholder="¿Qué necesitas hacer?"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <textarea
                                        value={newTaskDesc}
                                        onChange={e => setNewTaskDesc(e.target.value)}
                                        placeholder="Detalles adicionales (opcional)"
                                        rows="3"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 transition-colors resize-none"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Agregar Tarea
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Filters & Search */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                            <div className="relative w-full sm:w-64">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar tareas..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white transition-colors"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                {['all', 'active', 'completed'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === f
                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {f === 'all' ? 'Todas' : f === 'active' ? 'Pendientes' : 'Completadas'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {filteredTasks.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
                                    <ListTodo className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No hay tareas que mostrar</p>
                                </div>
                            ) : (
                                filteredTasks.map(task => (
                                    <div key={task.id} className={`group bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800 flex gap-4 items-start ${task.completed ? 'opacity-75' : ''}`}>
                                        <button
                                            onClick={() => toggleComplete(task)}
                                            className="mt-1 flex-shrink-0 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            {task.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6" />}
                                        </button>

                                        <div className="flex-grow min-w-0">
                                            {editingId === task.id ? (
                                                <div className="space-y-3">
                                                    <input
                                                        value={editTitle}
                                                        onChange={e => setEditTitle(e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                                    />
                                                    <textarea
                                                        value={editDesc}
                                                        onChange={e => setEditDesc(e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white text-sm resize-none"
                                                        rows="2"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditSave(task.id)} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Guardar</button>
                                                        <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h4 className={`text-lg font-medium truncate ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                        {task.title}
                                                    </h4>
                                                    {task.description && (
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 break-words">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {editingId !== task.id && (
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <button onClick={() => startEditing(task)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
