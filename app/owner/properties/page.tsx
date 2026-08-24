"use client";

import { useState } from "react";
import { Home, Plus, MapPin, Building, Trash2, Edit, Check } from "lucide-react";

export default function OwnerPropertiesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [properties, setProperties] = useState([
    { id: "1", name: "Jubilee Hills Duplex Plot", type: "Villa / Residential", city: "Hyderabad", state: "Telangana", pin: "500033", area: "2,400 Sq.ft" },
    { id: "2", name: "Whitefield Commercial Site", type: "Commercial Office", city: "Bengaluru", state: "Karnataka", pin: "560066", area: "5,000 Sq.ft" },
  ]);

  const [form, setForm] = useState({ name: "", type: "Residential", city: "", state: "", area: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setProperties([...properties, { id: Date.now().toString(), ...form, pin: "500001" }]);
    setShowAddModal(false);
    setForm({ name: "", type: "Residential", city: "", state: "", area: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Properties & Sites</h1>
          <p className="text-xs text-muted-foreground">Manage property locations, plot specifications, and construction sites</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" /> Add New Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground border">
                {p.type}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">{p.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                <span>{p.city}, {p.state} - {p.pin}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/30 border text-xs flex justify-between">
              <span className="text-muted-foreground font-semibold">Plot Area:</span>
              <span className="font-extrabold text-foreground">{p.area}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleAdd} className="w-full max-w-md rounded-2xl border bg-card p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-foreground">Add New Property Site</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gachibowli Commercial Plot"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border bg-background p-2.5 text-foreground"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Property Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border bg-background p-2.5 text-foreground"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial Office">Commercial Office</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-foreground block mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Hyderabad"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-lg border bg-background p-2.5 text-foreground"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Telangana"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full rounded-lg border bg-background p-2.5 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Plot Area (Sq.ft)</label>
                <input
                  type="text"
                  placeholder="2400 Sq.ft"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full rounded-lg border bg-background p-2.5 text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700">
                Save Property
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
