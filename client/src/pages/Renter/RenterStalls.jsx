import { useState, useEffect } from "react";

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

// --- Card ---
const StatusBadge = ({ status }) => (
  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
    status === "available" ? "bg-[#2d6a2d] text-white" : "bg-red-600 text-white"
  }`}>
    {status}
  </span>
);

const getStallImage = (section) => {
  const sec = (section || "").toLowerCase();
  if (sec.includes("fish") || sec.includes("sea")) return stallImages.seafood;
  if (sec.includes("meat")) return stallImages.meat;
  if (sec.includes("veg") || sec.includes("produce")) return stallImages.veggies;
  if (sec.includes("fruit")) return stallImages.fruits;
  return stallImages.dryGoods;
};

const StallCard = ({ stall, onClick }) => {
  const displayId = stall.stallNumber || stall.id || stall._id?.toString() || "";
  const displayCategory = stall.section || stall.category || "";
  const isVegetable = displayCategory.toLowerCase().includes("veg");
  const displayZone = isVegetable
    ? "Zone C"
    : (stall.floorArea ? (stall.floorArea === 'upper' ? 'Upper Floor' : 'Lower Floor') : (stall.zone ? `Zone ${stall.zone}` : ""));
  const displaySize = stall.size || 12;
  const displayPrice = stall.monthlyRate || stall.price || 0;
  const displayImg = stall.img || getStallImage(stall.section || stall.category);

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer"
    >
      <div className="relative h-36">
        <img src={displayImg} className="w-full h-full object-cover" />
        <StatusBadge status={stall.status} />
      </div>

      <div className="p-3">
        <p className="font-bold text-gray-900">Stall #{displayId}</p>
        <p className="text-xs text-gray-500">{displayZone} · {displayCategory}</p>

        <div className="text-xs font-semibold text-gray-700 mt-2">
          {displaySize} sqm · ₱{displayPrice.toLocaleString()}/mo
        </div>
      </div>
    </div>
  );
};

// --- MAIN ---
export default function RenterStalls({ onNavigate, onOpenStall }) {
  const [stalls, setStalls] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/contractor/stalls?hasContractor=true")
      .then((res) => res.json())
      .then((data) => setStalls(data))
      .catch(() => {
        // Mock data fallback
        setStalls([
          { id: "042", zone: "A", category: "Produce", status: "available", size: 12.5, price: 3200, img: stallImages.produce },
          { id: "089", zone: "D", category: "Fruits", status: "occupied", size: 15.0, price: 4500, img: stallImages.fruits },
          { id: "112", zone: "C", category: "Seafood", status: "available", size: 10.0, price: 2800, img: stallImages.seafood },
          { id: "055", zone: "A", category: "Dry Goods", status: "available", size: 12.5, price: 3200, img: stallImages.dryGoods },
          { id: "031", zone: "B", category: "Meat", status: "occupied", size: 18.0, price: 5100, img: stallImages.meat },
          { id: "077", zone: "B", category: "Vegetables", status: "available", size: 9.5, price: 2500, img: stallImages.veggies },
        ]);
      });
  }, []);

  const filters = ["All", "Available", "Occupied", "Zone A", "Zone B", "Zone C"];

  const filtered = stalls.filter((s) => {
    const stallCategory = s.category || s.section || "";
    const isVegetable = stallCategory.toLowerCase().includes("veg");
    const stallZone = isVegetable
      ? 'C'
      : (s.zone || (s.floorArea === 'upper' ? 'A' : (s.floorArea === 'lower' ? 'B' : 'A')));

    const matchSearch =
      (s.stallNumber || s.id || "").toString().toLowerCase().includes(search.toLowerCase()) ||
      stallZone.toLowerCase().includes(search.toLowerCase()) ||
      stallCategory.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ||
      (filter === "Available" && s.status === "available") ||
      (filter === "Occupied" && s.status === "occupied") ||
      filter === `Zone ${stallZone}`;

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
        <StallCard key={stall.id || stall._id} stall={stall} onClick={() => onOpenStall && onOpenStall(stall)} />
      ))}
        </div>

      </main>
    </div>
  );
}