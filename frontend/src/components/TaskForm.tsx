import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, PlusCircle, AlignLeft, Type } from 'lucide-react';

export const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [assignedTo, setAssignedTo] = useState('');
  const [developers, setDevelopers] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/users')
      .then(res => setDevelopers(res.data))
      .catch(err => console.error("Error cargando usuarios:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks', { 
        title, 
        description, 
        priority, 
        assigned_to: assignedTo ? parseInt(assignedTo) : null 
      });
      // Limpiar formulario tras éxito
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('LOW');
    } catch (error) {
      alert("Error al crear la tarea. Verifica los permisos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner"
    >
      {/* CAMPO: TÍTULO */}
      <div className="md:col-span-3">
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-wider">
          Título de la Tarea
        </label>
        <div className="relative group">
          <Type className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Ej: Fix login bug" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>
      
      {/* CAMPO: DESCRIPCIÓN */}
      <div className="md:col-span-3">
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-wider">
          Descripción Corta
        </label>
        <div className="relative group">
          <AlignLeft className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Detalles del ticket..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* CAMPO: PRIORIDAD */}
      <div className="md:col-span-2">
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-wider">
          Prioridad
        </label>
        <select 
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-medium text-gray-700 shadow-sm transition-all"
        >
          <option value="LOW">🟢 Baja</option>
          <option value="MEDIUM">🟡 Media</option>
          <option value="HIGH">🔴 Alta</option>
        </select>
      </div>

      {/* CAMPO: ASIGNACIÓN */}
      <div className="md:col-span-3">
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-wider">
          Asignar Desarrollador
        </label>
        <div className="relative group">
          <UserPlus className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <select 
            value={assignedTo} 
            onChange={(e) => setAssignedTo(e.target.value)} 
            required
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-medium text-gray-700 shadow-sm appearance-none"
          >
            <option value="">Seleccionar dev...</option>
            {developers.map(dev => (
              <option key={dev.id} value={dev.id}>{dev.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* BOTÓN SUBMIT CON EFECTO CLICK */}
      <div className="md:col-span-1">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          title="Crear nueva tarea"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          )}
        </button>
      </div>
    </form>
  );
};