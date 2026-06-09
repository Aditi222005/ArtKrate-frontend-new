// components/ArtistSummary.tsx
type Artist = {
  title: string;
  bio: string;
  profileImage: string;
  verified: boolean;
  artworksCount: number;
  followersCount: number;
};

const ArtistSummary = ({ artist }: { artist: Artist }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow flex gap-4 items-start">
      <img
        src={artist.profileImage}
        alt={artist.title}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div>
        <h3 className="text-lg font-semibold">{artist.title}</h3>
        <p className="text-sm text-gray-600 mb-1">{artist.bio}</p>
        <div className="text-xs text-gray-500">
          {artist.artworksCount} artworks · {artist.followersCount} followers
        </div>
      </div>
    </div>
  );
};

export default ArtistSummary;
