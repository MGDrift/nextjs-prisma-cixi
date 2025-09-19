"use client";

import { useEffect, useMemo, useState } from "react";
import { getCart, setQty, removeFromCart } from "../../libs/cart"; 

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [productsMap, setProductsMap] = useState({}); 

  useEffect(() => {
    setItems(getCart());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        const map = {};
        (Array.isArray(data) ? data : []).forEach((p) => (map[p.id] = p));
        setProductsMap(map);
      } catch {
        setProductsMap({});
      }
    })();
  }, []);

  const getMaxStock = (it) => {
    const live = productsMap[it.id]?.stock;
    if (typeof live === "number") return live;
    if (typeof it.stock === "number") return it.stock;
    return 9999;
  };

  const getLivePrice = (it) => {
    const live = productsMap[it.id]?.price;
    if (typeof live === "number") return live;
    return typeof it.price === "number" ? it.price : 0;
    };

  const total = useMemo(
    () => items.reduce((acc, it) => acc + getLivePrice(it) * (it.qty || 0), 0),
    [items, productsMap]
  );

  const dec = (it) => {
    const current = it.qty || 1;
    const next = Math.max(1, current - 1);
    const updated = setQty(it.id, next);
    setItems(updated);
  };

  const inc = (it) => {
    const current = it.qty || 1;
    const max = getMaxStock(it);
    if (current >= max) return; 
    const updated = setQty(it.id, current + 1);
    setItems(updated);
  };

  const changeQty = (it, value) => {
    let n = Number(value);
    if (!Number.isFinite(n)) n = 1;
    n = Math.max(1, Math.floor(n));
    n = Math.min(n, getMaxStock(it));
    const updated = setQty(it.id, n);
    setItems(updated);
  };

  const remove = (it) => {
    const updated = removeFromCart(it.id);
    setItems(updated);
  };

  return (
    <div className="min-h-screen bg-[#b48696]">
      {/* Navbar */}
      <nav className="bg-[#d9a5b2] shadow-lg py-4 px-6 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">ECOMMERCE CIXI ♡</h1>
        <div className="flex gap-4">
          <a href="/" className="text-white hover:text-[#623645] font-semibold">Home</a>
          <a href="/cart" className="text-white hover:text-[#623645] font-semibold">Carrito</a>
        </div>
      </nav>

      {/* Título centrado */}
      <div className="pt-10 px-4">
        <h2 className="text-center text-3xl text-white font-bold">Carrito de compras</h2>
      </div>

      {/* Contenido */}
      <div className="flex justify-center pt-6 px-4 pb-20">
        <div className="w-3/5 space-y-4">
          {items.length === 0 ? (
            <p className="text-xs text-slate-200 text-center mt-2">Tu carrito está vacío.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {items.map((it) => {
                  const max = getMaxStock(it);
                  const price = getLivePrice(it);
                  const subtotal = price * (it.qty || 0);

                  return (
                    <li
                      key={it.id}
                      className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow text-slate-900"
                    >
                      <div>
                        <div className="font-semibold text-[#623645] text-lg">{it.name}</div>
                        <div className="text-xs">Precio: ${price}</div>
                        <div className="text-xs">Stock disponible: {Number.isFinite(max) ? max : "—"}</div>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dec(it)}
                          disabled={(it.qty || 1) <= 1}
                          className="bg-[#623645] text-white rounded px-2 py-1 text-xs font-semibold shadow disabled:opacity-60"
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min={1}
                          max={max}
                          value={it.qty || 1}
                          onChange={(e) => changeQty(it, e.target.value)}
                          className="w-16 text-center rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
                        />

                        <button
                          onClick={() => inc(it)}
                          disabled={(it.qty || 1) >= max}
                          className="bg-[#623645] text-white rounded px-2 py-1 text-xs font-semibold shadow disabled:opacity-60"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal y eliminar */}
                      <div className="flex items-center gap-3">
                        <div className="text-[#623645] font-semibold">${subtotal}</div>
                        <button
                          onClick={() => remove(it)}
                          className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Total */}
              <div className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 flex justify-between items-center shadow">
                <span className="text-[#623645] font-bold">Total</span>
                <span className="text-[#623645] font-bold">${total}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
