import { useEffect, useState } from "react";
import axios from "axios";

interface Artwork {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'sold' | 'draft';
  images: string[];
  createdAt: string;
}

const MyArtwork = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/sellerpost/mine", {
          withCredentials: true,
        });
        setArtworks(res.data || []);
      } catch (err) {
        console.error("Error fetching artworks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "sold":
        return "Sold";
      case "draft":
        return "Draft";
      default:
        return "Unknown";
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this artwork?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/sellerpost/${id}`, {
        withCredentials: true,
      });

      // Remove it from local state
      setArtworks((prev) => prev.filter((art) => art._id !== id));
    } catch (err) {
      console.error("Failed to delete artwork:", err);
      alert("Error deleting artwork. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading your artworks...</p>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎨</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks yet</h3>
        <p className="text-gray-600 mb-4">
          Start by posting your first artwork to showcase your talent
        </p>
        <button className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
          Post Your First Artwork
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Artworks ({artworks.length})</h2>
        {/* You can add filters here if needed */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <div
            key={artwork._id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={artwork.images?.[0] || "/placeholder.svg"}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(artwork.status)}`}
                >
                  {getStatusText(artwork.status)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{artwork.title}</h3>
                <span className="text-lg font-bold text-gray-900">${artwork.price}</span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {artwork.description}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>{artwork.category}</span>
                <span>{new Date(artwork.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex space-x-2">
               
                <button onClick={() => handleDelete(artwork._id)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 transition-colors">
                  Delete
                </button>
                
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyArtwork;
