import { useState, useEffect } from 'react';
import api from './../api/axios';
import { socket } from '../socket';

export const useTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    // 1. Cargar tareas guardadas en Neon
    api.get('/tasks').then(res => {
      setTasks(res.data);
    });

    // 2. Escuchar cuando el backend emite 'task:created'
    // socket.on('task:created', (newTask) => {
    //     setTasks((prev) => [newTask, ...prev]);
    // });
    socket.on('task:created', (newTask) => {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  
        // REGLA DE FILTRO:
        // 1. Si soy ADMIN, la agrego siempre.
        // 2. Si soy DEVELOPER, solo la agrego si el assigned_to coincide con mi ID.
        if (savedUser.role === 'ADMIN' || newTask.assigned_to === savedUser.id) {
            setTasks((prev) => [newTask, ...prev]);
        }
    });

    socket.on('task:deleted', (deletedId) => {
    // Filtramos la tarea de la lista para que desaparezca
        setTasks((prev) => prev.filter(task => task.id !== Number(deletedId)));
    });

    socket.on('task:updated', (updatedTask) => {
        setTasks((prev) => 
        prev.map(task => task.id === updatedTask.id ? updatedTask : task)
        );
    });

    return () => {
        socket.off('task:created');
    };
  }, []);

  return { tasks };
};