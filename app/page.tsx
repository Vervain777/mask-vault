'use client';

import React, { useState, useEffect } from 'react';
import { Smile, Frown, Search, Lock, Package, Smartphone, Download, X, ShieldCheck, Trash2, ExternalLink, Timer, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Item {
  id: number;
  title: string;
  category: 'Mod' | 'App';
  version: string;
  downloads: number;
  image: string;
  description: string;
  download_url: string;
}

export default function Home() {
  const [filter, setFilter] = useState<'all' | 'Mod' | 'App'>('all');
  const [searchTerm, setSearchTerm] = useState('');
 
  // Estado para el modal de Admin
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Estado para el modal de Descarga con Conteo
  const [selectedDownload, setSelectedDownload] = useState<{ title: string; url: string; version: string } | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [canDownload, setCanDownload] = useState(false);

  // Formulario de nuevo mod
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Mod' | 'App'>('Mod');
  const [newVersion, setNewVersion] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDownloadUrl, setNewDownloadUrl] = useState('');

  // Estado de los items y de carga
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const SECRET_PASSWORD = 'ys4;3/0:g';

  // Cargar items desde Supabase
  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error cargando datos de Supabase:', error);
    } else if (data) {
      setItems(data as Item[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Manejar el temporizador de la descarga
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedDownload && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanDownload(true);
    }
    return () => clearTimeout(timer);
  }, [selectedDownload, countdown]);

  const handleOpenDownloadModal = (item: { title: string; download_url: string; version: string }) => {
    setSelectedDownload({ title: item.title, url: item.download_url, version: item.version });
    setCountdown(5); // Segundos de espera
    setCanDownload(false);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === SECRET_PASSWORD) {
      setIsAdminAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      title: newTitle,
      category: newCategory,
      version: newVersion,
      downloads: 0,
      image: newCategory === 'Mod'
        ? "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60",
      description: newDescription,
      download_url: newDownloadUrl || "#"
    };

    const { data, error } = await supabase.from('items').insert([newItem]).select();

    if (error) {
      alert('Error guardando en la base de datos: ' + error.message);
    } else if (data) {
      setItems([data[0] as Item, ...items]);
      setShowAdminModal(false);
     
      setNewTitle('');
      setNewVersion('');
      setNewDescription('');
      setNewDownloadUrl('');
    }
  };

  const handleDeleteItem = async (idToDelete: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación de la base de datos?')) {
      const { error } = await supabase.from('items').delete().eq('id', idToDelete);
      if (error) {
        alert('Error al eliminar: ' + error.message);
      } else {
        setItems(items.filter(item => item.id !== idToDelete));
      }
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
         
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex items-center -space-x-1 p-2 bg-neutral-900 border border-neutral-800 rounded-xl group-hover:border-neutral-600 transition">
              <Smile className="w-5 h-5 text-white" />
              <Frown className="w-5 h-5 text-neutral-400 -scale-x-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wider text-white uppercase">
                MaskVault
              </span>
              <span className="text-[10px] text-neutral-500 tracking-widest uppercase -mt-1 font-mono">
                Mods & Apps
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar mods, APKs..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white transition font-mono"
            />
          </div>

          <button
            onClick={() => setShowAdminModal(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition duration-200 ${
              isAdminAuthenticated
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-white hover:text-black'
            }`}
          >
            {isAdminAuthenticated ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isAdminAuthenticated ? 'Modo Admin' : 'Admin'}</span>
          </button>

        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-900 mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Repositorio de Contenido
            </h1>
            <p className="text-neutral-500 text-xs mt-0.5">
              Descargas directas de aplicaciones y modificaciones.
            </p>
          </div>

          <div className="flex gap-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === 'all' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('Mod')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${filter === 'Mod' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
            >
              <Package className="w-3.5 h-3.5" /> Mods
            </button>
            <button
              onClick={() => setFilter('App')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${filter === 'App' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Apps
            </button>
          </div>
        </div>

        {/* Grilla de Tarjetas */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-white" />
            <p className="text-xs font-mono">Cargando publicaciones desde Supabase...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl">
            <p className="text-neutral-400 text-sm font-mono">No se encontraron publicaciones en la base de datos.</p>
            <p className="text-neutral-600 text-xs mt-1">Usa el panel de Admin para agregar la primera.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 transition group flex flex-col relative"
              >
                {isAdminAuthenticated && (
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    title="Eliminar publicación"
                    className="absolute top-3 left-3 bg-red-950/80 hover:bg-red-600 border border-red-800/80 text-red-200 hover:text-white p-2 rounded-xl backdrop-blur-md z-10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="h-44 overflow-hidden relative bg-neutral-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80 group-hover:opacity-100"
                  />
                  <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-[11px] font-mono px-2 py-1 rounded-lg border border-neutral-700 text-neutral-300">
                    {item.version}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="inline-block text-[10px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 mb-2 font-mono">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-base text-white group-hover:text-neutral-200 transition">
                      {item.title}
                    </h3>
                    <p className="text-neutral-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-neutral-900">
                    <span className="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> {item.downloads}
                    </span>
                    <button
                      onClick={() => handleOpenDownloadModal(item)}
                      className="bg-white hover:bg-neutral-200 text-black px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Descarga con Conteo y Anuncio */}
      {selectedDownload && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl text-center">
            <button
              onClick={() => setSelectedDownload(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mx-auto mb-3">
              <Download className="w-6 h-6" />
            </div>

            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
              Generando enlace de descarga
            </span>
            <h2 className="text-xl font-bold mt-1 text-white">{selectedDownload.title}</h2>
            <p className="text-xs font-mono text-neutral-400 mt-0.5 mb-6">Versión: {selectedDownload.version}</p>

            {/* Espacio Reservado para el Anuncio */}
            <div className="bg-neutral-900/60 border border-neutral-800 border-dashed rounded-xl p-8 mb-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest absolute top-2 left-3">
                Publicidad
              </span>
             
              <div id="ad-banner-container" className="text-center">
                <AlertCircle className="w-6 h-6 text-neutral-600 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-neutral-500 font-mono">
                  [ Aquí aparecerá el banner publicitario ]
                </p>
              </div>
            </div>

            {/* Cuenta regresiva / Botón final */}
            {!canDownload ? (
              <div className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 text-neutral-300 py-3 rounded-xl font-mono text-sm">
                <Timer className="w-4 h-4 animate-spin text-white" />
                <span>Tu enlace estará listo en <strong className="text-white font-bold">{countdown}</strong> segundos...</span>
              </div>
            ) : (
              <a
                href={selectedDownload.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedDownload(null)}
                className="inline-flex items-center justify-center gap-2 w-full bg-white hover:bg-neutral-200 text-black font-extrabold py-3 rounded-xl text-sm transition shadow-lg shadow-white/10"
              >
                <span>IR A LA DESCARGA AHORA</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Modal de Admin */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {!isAdminAuthenticated ? (
              <div>
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold mb-1">Acceso de Administrador</h2>
                <p className="text-xs text-neutral-500 mb-4">Ingresa la clave para gestionar contenido.</p>

                <form onSubmit={handleAdminLogin} className="space-y-4 font-mono">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-2.5 rounded-xl text-xs transition">
                    Entrar al Panel
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2 font-mono">
                  <span className="flex items-center gap-2 text-emerald-400 text-xs">
                    <ShieldCheck className="w-4 h-4" /> Sesión Activa
                  </span>
                  <button
                    onClick={() => setIsAdminAuthenticated(false)}
                    className="text-[11px] text-neutral-500 hover:text-red-400 underline"
                  >
                    Cerrar sesión
                  </button>
                </div>
                <h2 className="text-lg font-bold mb-1">Publicar Mod / App</h2>
                <p className="text-xs text-neutral-500 mb-4">Llena los datos para crear un ítem nuevo en Supabase.</p>

                <form onSubmit={handleCreateItem} className="space-y-3 font-mono">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Título</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej: Call of Duty Mod Menu"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Tipo</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as 'Mod' | 'App')}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                      >
                        <option value="Mod">Mod</option>
                        <option value="App">App (APK)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Versión</label>
                      <input
                        type="text"
                        value={newVersion}
                        onChange={(e) => setNewVersion(e.target.value)}
                        placeholder="Ej: v1.0"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="¿Qué incluye esta versión?"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Enlace de descarga (URL)</label>
                    <input
                      type="url"
                      value={newDownloadUrl}
                      onChange={(e) => setNewDownloadUrl(e.target.value)}
                      placeholder="https://mediafire.com/file..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-2.5 rounded-xl text-xs transition mt-2">
                    Publicar Ahora
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}