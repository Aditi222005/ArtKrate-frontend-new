import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, Eye, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Artists = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [artists, setArtists] = useState<any[]>([]);
  const [followedArtists, setFollowedArtists] = useState<{ [key: string]: boolean }>({});
  const [user, setUser] = useState<any>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await axios.get("/api/sellerpost/artists", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        setArtists(res.data.artists);
        const followMap: { [key: string]: boolean } = {};
        res.data.artists.forEach((artist: any) => {
          followMap[artist.id] = artist.isFollowing;
        });
        setFollowedArtists(followMap);
      } catch (err) {
        console.error("Error loading artists:", err);
      }
    };
    fetchArtists();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("/api/me", { withCredentials: true });
        if (res.status === 200 && res.data?.user) setUser(res.data.user);
      } catch { setUser(null); }
    };
    checkUser();
  }, []);

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollow = async (artistId: string) => {
    if (!isAuthenticated) { navigate("/login"); return; }
    try {
      const res = await axios.post(`/api/follow/${artistId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      setFollowedArtists(prev => ({ ...prev, [artistId]: res.data.following }));
      toast.success(res.data.following ? "Now following!" : "Unfollowed.");
    } catch {
      toast.error("Failed to update follow status.");
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-gold/3 blur-[160px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-terra/3 blur-[140px]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ──────────────────────────────────────── */}
          <div className="mb-10">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-2">Our Community</p>
            <h1 className="font-display text-cream mb-3">
              Featured <span className="italic text-gold-gradient">Artists</span>
            </h1>
            <p className="text-cream-muted text-lg max-w-xl">
              Connect with verified artists and discover their unique creative worlds
            </p>
          </div>

          {/* ── Search ──────────────────────────────────────── */}
          <div className="mb-10 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
              <input
                placeholder="Search artists or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark pl-10"
              />
            </div>
          </div>

          {/* ── Artists Grid ─────────────────────────────────── */}
          {filteredArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="bg-surface border border-surface-border rounded-2xl overflow-hidden group hover:border-gold/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_hsl(24_12%_4%/0.8)]"
                >
                  {/* Cover banner */}
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src="https://img.freepik.com/free-vector/monochrome-low-poly-design_1048-17214.jpg"
                      alt={`${artist.name} cover`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/80" />
                  </div>

                  <div className="px-6 pb-6 relative">
                    {/* Avatar */}
                    <div className="absolute -top-10 left-6">
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-20 h-20 rounded-full border-4 border-surface object-cover shadow-xl"
                      />
                    </div>

                    <div className="pt-12">
                      {/* Name + specialty */}
                      <div className="mb-3">
                        <h3 className="font-display text-cream text-xl font-bold mb-1">{artist.name}</h3>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium">
                          {artist.specialty}
                        </span>
                      </div>

                      {/* Location + Rating */}
                      <div className="flex items-center gap-4 text-sm text-cream-subtle mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {artist.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" /> {artist.rating}
                        </span>
                      </div>

                      {/* Bio */}
                      <p className="text-cream-muted text-sm leading-relaxed mb-4 line-clamp-2">
                        {artist.bio}
                      </p>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 text-xs text-cream-subtle mb-5 py-3 border-t border-surface-border">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-gold" />
                          {artist.followersCount} followers
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-gold" />
                          {artist.views || 0} views
                        </span>
                        <span>{artist.artworksCount} works</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!user) navigate("/login");
                            else navigate(`/artist/${artist.id}`);
                          }}
                          className="btn-terra flex-1 text-sm py-2.5"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleFollow(artist.id)}
                          className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                            followedArtists[artist.id]
                              ? "bg-gold/10 border-gold/40 text-gold hover:bg-gold/20"
                              : "border-surface-border text-cream-muted hover:border-gold/40 hover:text-cream"
                          }`}
                        >
                          {followedArtists[artist.id] ? "Following" : "Follow"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-surface-border flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-cream-subtle" />
              </div>
              <h3 className="font-display text-cream text-xl mb-2">No artists found</h3>
              <p className="text-cream-muted">Try a different search term</p>
            </div>
          )}

          {/* Load More */}
          {filteredArtists.length > 0 && (
            <div className="text-center mt-14">
              <button className="btn-gold-outline inline-flex items-center gap-2 px-8 py-3">
                Load More Artists
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Artists;
