import { useState } from "react";

// --- Icons ---
const Icon = ({ d, size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);

const SearchIcon = () => (
  <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
);

const CloseIcon = () => <Icon d="M18 6L6 18M6 6l12 12" size={16} />;

const PlusIcon = () => <Icon d="M12 5v14M5 12h14" size={18} />;

// --- Data ---
const stallImages = {
  produce: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop",
  fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=200&fit=crop",
  seafood: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=200&fit=crop",
  dryGoods: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=200&fit=crop",
  meat: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=200&fit=crop",
  veggies: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=200&fit=crop",
};

const stalls = [
  { id: "042", zone: "A", category: "Produce", status: "available", size: 12.5, price: 3200, img: stallImages.produce },
  { id: "089", zone: "D", category: "Fruits", status: "occupied", size: 15.0, price: 4500, img: stallImages.fruits },
  { id: "112", zone: "C", category: "Seafood", status: "available", size: 10.0, price: 2800, img: stallImages.seafood },
  { id: "055", zone: "A", category: "Dry Goods", status: "available", size: 12.5, price: 3200, img: stallImages.dryGoods },
  { id: "031", zone: "B", category: "Meat", status: "occupied", size: 18.0, price: 5100, img: stallImages.meat },
  { id: "077", zone: "B", category: "Vegetables", status: "available", size: 9.5, price: 2500, img: stallImages.veggies },
];

// --- Card ---
const StatusBadge = ({ status }) => (
  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
    status === "available" ? "bg-[#2d6a2d] text-white" : "bg-red-600 text-white"
  }`}>
    {status}
  </span>
);

const StallCard = ({ stall }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
    <div className="relative h-36">
      <img src={stall.img} className="w-full h-full object-cover" />
      <StatusBadge status={stall.status} />
    </div>

    <div className="p-3">
      <p className="font-bold">#{stall.id}</p>
      <p className="text-xs text-gray-500">{stall.zone} · {stall.category}</p>

      <div className="text-xs text-gray-500 mt-2">
        {stall.size} sqm · ₱{stall.price}/mo
      </div>
    </div>
  </div>
);

// --- MAIN ---
export default function ContractorStalls() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Available", "Occupied", "Zone A", "Zone B", "Zone C", "Zone D"];

  const filtered = stalls.filter((s) => {
    const matchSearch =
      s.id.includes(search) ||
      s.zone.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ||
      (filter === "Available" && s.status === "available") ||
      (filter === "Occupied" && s.status === "occupied") ||
      filter === `Zone ${s.zone}`;

    return matchSearch && matchFilter;
  });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#f5f5f0] font-sans">

      <main className="px-4 md:px-6 py-5 space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Market Stalls</h1>
            <p className="text-sm text-gray-500">Browse available stalls</p>
          </div>

          <button className="w-10 h-10 bg-[#e87722] text-white rounded-full flex items-center justify-center">
            <PlusIcon />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stalls..."
            className="w-full bg-white border rounded-xl pl-9 pr-9 py-2"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs ${
                filter === f ? "bg-[#2d6a2d] text-white" : "bg-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((stall) => (
            <StallCard key={stall.id} stall={stall} />
          ))}
        </div>

      </main>
    </div>
  );
}