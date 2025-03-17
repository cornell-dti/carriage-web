import React from 'react';
import styles from './favoritescard.module.css';
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
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Favorites</h2>
        <button className={styles.addButton} onClick={onAddNew}>
          <AddIcon fontSize="small" />
        </button>
      </div>

      <div className={styles.favoritesList}>
        {favorites.length === 0 && (
          <div className={styles.emptyMessage}>
            No favorite rides yet. Click the + button to add one.
          </div>
        )}
        {favorites.map((fav) => (
          <div key={fav.id} className={styles.favoriteItem}>
            <div className={styles.favoriteInfo}>
              <h3 className={styles.favoriteName}>{fav.name}</h3>
              <div className={styles.detail}>
                <LocationOnIcon fontSize="small" />
                <span className={styles.label}>Pick-up:</span>
                <span>{fav.startLocation.name}</span>
              </div>
              <div className={styles.detail}>
                <LocationOnIcon fontSize="small" />
                <span className={styles.label}>Drop-off:</span>
                <span>{fav.endLocation.name}</span>
              </div>
              <div className={styles.detail}>
                <AccessTimeIcon fontSize="small" />
                <span className={styles.label}>Preferred Time:</span>
                <span>{fav.preferredTime}</span>
              </div>
            </div>
            <button
              className={`${styles.button} ${styles.requestButton}`}
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
