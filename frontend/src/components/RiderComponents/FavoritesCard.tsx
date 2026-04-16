import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Assume FavoriteRide is a simplified ride-like structure
interface FavoriteRide {
  id: string;
  name: string;
  // Using the same structure as Ride for locations
  startLocation: {
    name: string;
    address?: string;
    tag?: string;
  };
  endLocation: {
    name: string;
    address?: string;
    tag?: string;
  };
  preferredTime: string; // The user's preferred time for this unscheduled ride
}

interface FavoritesCardProps {
  favorites: FavoriteRide[];
  onAddNew?: () => void;
  onQuickRequest?: (id: string) => void;
}

const FavoritesCard: React.FC<FavoritesCardProps> = ({
  favorites,
  onAddNew,
  onQuickRequest,
}) => {
  return (
    <div className="h-fit max-h-50 bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] p-4 text-black flex flex-col">
      <div className="flex items-center mb-2 pb-2 border-b border-[#f0f0f0]">
        <h2 className="m-0 text-[1.1rem] text-[#333] flex-1">Favorites</h2>
        <button className="bg-transparent border-0 cursor-pointer p-1 rounded transition-colors duration-200" onClick={onAddNew}>
          <AddIcon fontSize="small" />
        </button>
      </div>

      <div className="max-h-37.5 flex flex-col gap-4 overflow-y-auto pr-2.5">
        {favorites.length === 0 && (
          <div className="text-[#666] text-sm py-2">
            No favorite rides yet. Click the + button to add one.
          </div>
        )}
        {favorites.map((fav) => (
          <div key={fav.id} className="flex items-center justify-between bg-[#f9f9f9] rounded-md p-3">
            <div className="flex flex-col gap-1 flex-1">
              <h3 className="m-0 text-[0.95rem] text-[#333] font-semibold mb-1">{fav.name}</h3>
              <div className="flex items-center gap-1.5 text-sm">
                <LocationOnIcon fontSize="small" />
                <span className="font-medium text-[#555] min-w-13.75">Pick-up:</span>
                <span>{fav.startLocation.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <LocationOnIcon fontSize="small" />
                <span className="font-medium text-[#555] min-w-13.75">Drop-off:</span>
                <span>{fav.endLocation.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <AccessTimeIcon fontSize="small" />
                <span className="font-medium text-[#555] min-w-13.75">Preferred Time:</span>
                <span>{fav.preferredTime}</span>
              </div>
            </div>
            <button
              className="py-1.5 px-3 border-0 rounded font-medium cursor-pointer transition-colors duration-200 text-sm whitespace-nowrap ml-3 bg-black text-white"
              onClick={() => onQuickRequest && onQuickRequest(fav.id)}
            >
              Quick Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesCard;
