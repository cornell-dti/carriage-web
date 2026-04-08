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
  preferredTime: string; // The user’s preferred time for this unscheduled ride
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
    <div card}>
      <div header}>
        <h2>Favorites</h2>
        <button addButton} onClick={onAddNew}>
          <AddIcon fontSize="small" />
        </button>
      </div>

      <div favoritesList}>
        {favorites.length === 0 && (
          <div emptyMessage}>
            No favorite rides yet. Click the + button to add one.
          </div>
        )}
        {favorites.map((fav) => (
          <div key={fav.id} favoriteItem}>
            <div favoriteInfo}>
              <h3 favoriteName}>{fav.name}</h3>
              <div detail}>
                <LocationOnIcon fontSize="small" />
                <span label}>Pick-up:</span>
                <span>{fav.startLocation.name}</span>
              </div>
              <div detail}>
                <LocationOnIcon fontSize="small" />
                <span label}>Drop-off:</span>
                <span>{fav.endLocation.name}</span>
              </div>
              <div detail}>
                <AccessTimeIcon fontSize="small" />
                <span label}>Preferred Time:</span>
                <span>{fav.preferredTime}</span>
              </div>
            </div>
            <button
              className={`button} ${requestButton}`}
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
