'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/usuarios');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setUsuarios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      
      <div className="space-y-4">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="border p-4 rounded">
            <h2 className="font-semibold">{usuario.nombre}</h2>
            <p>{usuario.email}</p>
            <p>{usuario.edad} años</p>
          </div>
        ))}
      </div>
    </div>
  );
}