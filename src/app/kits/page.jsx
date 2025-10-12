"use client";

import { useEffect, useState } from "react";

export default function CreateKitPage() {
  const [name, setName] = useState("");
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    })();
  }, []);

  const toggle = (pId, checked) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) {
        next[pId] = next[pId] ?? 1;
      } else {
        delete next[pId];
      }
      return next;
    });
  };

  const setQty = (pId, v) => {
    setSelected((prev) => ({
      ...prev,
      [pId]: Math.max(1, Math.floor(Number(v) || 1)),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    const items = Object.entries(selected).map(([productId, quantity]) => ({
      productId: Number(productId),
      quantity,
    }));

    if (items.length === 0) {
      alert("Debe seleccionar al menos un producto para crear un kit");
      return; 
    }

    if (!name.trim()) {
      alert("Ingresa un nombre para el kit");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), items }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || `Error ${res.status}`);
        return;
      }

      
      setName("");
      setSelected({});
      setMessage("Kit creado exitosamente"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#b48696]">
      {/* Navbar */}
      <nav className="bg-[#d9a5b2] shadow-lg py-4 px-6 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">ECOMMERCE CIXI ♡</h1>
        <div className="flex gap-4">
          <a href="/" className="text-white hover:text-[#623645] font-semibold">Home</a>
          <a href="/kits" className="text-white hover:text-[#623645] font-semibold">Kits</a>
        </div>
      </nav>

      {/* Contenido */}
      <div className="flex justify-center pt-10 px-4 pb-16">
        <div className="w-3/5 space-y-6">
          <h2 className="text-3xl text-white font-bold text-center">Crear kit</h2>

          <form onSubmit={submit} className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 shadow space-y-4">
            <div>
              <label className="block text-[#623645] text-sm font-semibold mb-1">Nombre del kit</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Kit de baño"
                className="w-full rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-sm px-3 py-2 shadow"
              />
            </div>

            <div>
              <div className="text-[#623645] text-sm font-semibold mb-2">Selecciona productos</div>
              <ul className="space-y-2">
                {products.map((p) => {
                  const checked = selected[p.id] != null;
                  const qty = selected[p.id] ?? 1;
                  return (
                    <li
                      key={p.id}
                      className="rounded-lg border border-[#dac2b2] bg-[#f6d7e1] p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggle(p.id, e.target.checked)}
                          className="accent-[#623645]"
                        />
                        <div className="text-sm text-[#623645]">
                          <div className="font-semibold">{p.name}</div>
                          <div className="opacity-80 text-xs">
                            Precio: {p.price != null ? `$${p.price}` : "—"} · Stock: {p.stock ?? 0}
                          </div>
                        </div>
                      </div>

                      {checked && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#623645]">Cantidad</span>
                          <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) => setQty(p.id, e.target.value)}
                            className="w-20 text-center rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#623645] text-white rounded px-4 py-2 text-sm font-semibold shadow disabled:opacity-60"
              >
                {loading ? "Creando..." : "Crear kit"}
              </button>
            </div>

            {message && (
              <p className="text-center text-[#623645] text-sm font-semibold">{message}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
