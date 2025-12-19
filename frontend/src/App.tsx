import { useState, useEffect, useMemo } from 'react';
import { useTasks } from './hooks/useTasks';
import { Login } from './components/Login';
import { TaskForm } from './components/TaskForm';
import { Modal } from './components/Modal'; // Asegúrate de haber creado este archivo
import { logout } from './api/auth';
import { Trash2, LogOut, CheckCircle, Clock, User, Filter, BarChart3, Layout, SortAsc, Search } from 'lucide-react';
import api from './api/axios';

function App() {
  const [user, setUser] = useState<any>(null);
  const { tasks = [] } = useTasks();
  
  // Estados de Filtros y Búsqueda
  const [filterUser, setFilterUser] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [developers, setDevelopers] = useState<{id: number, name: string}[]>([]);

  // Estados de Modales
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/auth/users').then(res => setDevelopers(res.data || []));
    }
  }, [user]);

  const taskCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    tasks.forEach(task => {
      if (task?.assigned_to) counts[task.assigned_to] = (counts[task.assigned_to] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task: any) => {
      const matchesUser = user?.role !== 'ADMIN' || filterUser === 'all' || task.assigned_to === parseInt(filterUser);
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesUser && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityWeight: any = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return b.id - a.id;
    });
  }, [tasks, user, filterUser, sortBy, searchTerm]);

  if (!user) {
    return (
      <Login 
        onLoginSuccess={() => {
          const userData = JSON.parse(localStorage.getItem('user')!);
          setUser(userData);
          window.location.reload(); 
        }} 
      />
    );
  }

  // --- ACCIONES DE MODAL ---
  const handleConfirmLogout = () => {
    logout();
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await api.delete(`/tasks/${taskToDelete}`);
        setTaskToDelete(null);
      } catch (e) { alert("Error al eliminar"); }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    if (user.role === 'ADMIN') return;
    try {
      const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
      await api.patch(`/tasks/${id}`, { status: newStatus });
    } catch (e) { alert("Error al actualizar"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
                <Layout size={24} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                  TaskFlow
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] text-green-600 font-black tracking-tighter">LIVE</span>
                  </div>
                </h1>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                  {user.name} • <span className="text-indigo-600">{user.role}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsLogoutModalOpen(true)} 
              className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all cursor-pointer active:scale-95 group"
            >
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'ADMIN' && (
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-widest text-[11px]">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Panel de Creación
            </h2>
            <TaskForm />
          </section>
        )}

        {/* BARRA DE FILTROS, BÚSQUEDA Y ORDEN */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative group min-w-[280px]">
              <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>

            {user.role === 'ADMIN' && (
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-gray-400" />
                <select 
                  value={filterUser} 
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="bg-gray-50 border border-gray-100 text-sm font-bold rounded-xl p-2 cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                >
                  <option value="all">Todos los Usuarios ({tasks.length})</option>
                  {developers.map(dev => (
                    <option key={dev.id} value={dev.id}>{dev.name} ({taskCounts[dev.id] || 0})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3">
              <SortAsc size={18} className="text-gray-400" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-100 text-sm font-bold rounded-xl p-2 cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              >
                <option value="newest">Más recientes</option>
                <option value="priority">Mayor prioridad</option>
              </select>
            </div>
          </div>
        </div>

        {/* GRILLA DE TAREAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map((task: any) => (
            <div 
              key={task.id} 
              className={`group bg-white rounded-[2rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden ${
                task.status === 'DONE' ? 'border-green-200 bg-green-50/20' : 'border-gray-100'
              }`}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.1em] uppercase shadow-sm ${
                    task.priority === 'HIGH' ? 'bg-red-500 text-white shadow-red-100' : 
                    task.priority === 'MEDIUM' ? 'bg-amber-400 text-white shadow-amber-100' : 
                    'bg-blue-500 text-white shadow-blue-100'
                  }`}>
                    {task.priority}
                  </span>
                  
                  <button 
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    disabled={user.role === 'ADMIN'}
                    className={`transition-all duration-300 transform ${
                      user.role === 'ADMIN' 
                        ? 'opacity-40 cursor-default' 
                        : 'cursor-pointer hover:scale-125 active:scale-90'
                    }`}
                  >
                    <CheckCircle 
                      size={34} 
                      // Si está DONE: Verde con relleno suave. Si no: Gris claro sin relleno.
                      className={`transition-colors duration-300 ${
                        task.status === 'DONE' 
                          ? 'text-green-500 fill-green-100' 
                          : 'text-gray-200 fill-none hover:text-indigo-400'
                      }`}
                    />
                  </button>
                </div>

                <h3 className={`text-xl font-black mb-3 leading-tight ${task.status === 'DONE' ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                  {task.title}
                </h3>

                {user.role === 'ADMIN' && (
                  <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-black mb-5 bg-indigo-50/80 py-2 px-4 rounded-xl w-fit tracking-widest border border-indigo-100">
                    <User size={14} />
                    {task.assigned_name?.toUpperCase() || 'SIN ASIGNAR'}
                  </div>
                )}

                <p className={`text-sm leading-relaxed mb-8 ${task.status === 'DONE' ? 'text-gray-300' : 'text-gray-500'}`}>
                  {task.description}
                </p>

                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <div className={`flex items-center gap-2 text-[10px] font-black tracking-widest ${task.status === 'DONE' ? 'text-green-500' : 'text-gray-400'}`}>
                    <Clock size={14} />
                    {task.status === 'DONE' ? 'COMPLETADA' : 'PENDIENTE'}
                  </div>
                  
                  {user.role === 'ADMIN' && (
                    <button 
                      onClick={() => setTaskToDelete(task.id)} 
                      className="p-2.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all cursor-pointer active:scale-75"
                    >
                      <Trash2 size={22} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODALES PERSONALIZADOS */}
        <Modal 
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
          title="¿Cerrar Sesión?"
          message="¿Estás seguro de que quieres salir de TaskFlow? Tendrás que volver a ingresar tus credenciales."
        />

        <Modal 
          isOpen={taskToDelete !== null}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="¿Eliminar Tarea?"
          message="Esta acción es permanente y no podrás recuperar la información de esta tarea."
        />

      </main>
    </div>
  );
}

export default App;