"use client";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [name, setName] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = await res.json();
    setList(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function createCategory(e) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName("");
      setMsg("✅ Categoría creada");
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data?.error || "❌ Error creando categoría");
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold">Categorías</h1>

      <form onSubmit={createCategory} className="flex gap-2">
        <input
          className="border rounded p-2 flex-1 bg-slate-800 text-white placeholder-gray-400"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4">
          Crear
        </button>
      </form>

      {msg && <p className="text-sm text-gray-300">{msg}</p>}
      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-400">No hay categorías aún.</p>
      ) : (
        <ul className="list-disc pl-6 space-y-1">
          {list.map((c) => (
            <li key={c.id} className="text-white">{c.name}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
