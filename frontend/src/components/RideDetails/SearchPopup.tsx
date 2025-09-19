import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Button,
  Paper,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { Driver, Rider } from '../../types';

interface SearchPopupProps<T extends Driver | Rider> {
  open: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  items: T[];
  loading?: boolean;
  error?: string | null;
  title: string;
  placeholder?: string;
  selectedItems?: T[];
  onRemove?: (item: T) => void;
  showAccessibility?: boolean;
  anchorEl?: HTMLElement | null;
}

const SearchPopup = <T extends Driver | Rider>({
  open,
  onClose,
  onSelect,
  items,
  loading = false,
  error,
  title,
  placeholder = "Search...",
  selectedItems = [],
  onRemove,
  showAccessibility = false,
  anchorEl,
}: SearchPopupProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [items, searchTerm]);

  // Position the popup relative to anchor element
  useEffect(() => {
    if (open && anchorEl && popupRef.current) {
      const rect = anchorEl.getBoundingClientRect();
      const popup = popupRef.current;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate position
      let top = rect.bottom + 12; // More space below button
      let left = rect.left;
      
      // Adjust if popup would go off screen
      if (top + 400 > viewportHeight) {
        top = rect.top - 400 - 12; // Position above with more space
      }
      if (left + 320 > viewportWidth) {
        left = viewportWidth - 320 - 16; // Adjust to fit
      }
      
      popup.style.position = 'fixed';
      popup.style.top = `${Math.max(8, top)}px`;
      popup.style.left = `${Math.max(8, left)}px`;
      popup.style.zIndex = '1300'; // Higher than MUI modals
    }
  }, [open, anchorEl]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) && 
          anchorEl && !anchorEl.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onClose, anchorEl]);

  const handleItemClick = (item: T) => {
    onSelect(item);
    setSearchTerm('');
  };

  const isSelected = (item: T) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  const getAccessibilityInfo = (item: T) => {
    if (!showAccessibility || !('accessibility' in item)) return null;
    const rider = item as Rider;
    return rider.accessibility && rider.accessibility.length > 0 ? rider.accessibility : null;
  };

  if (!open) return null;

  return (
    <Paper
      ref={popupRef}
      elevation={8}
      sx={{
        width: 320,
        maxHeight: 400,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          autoFocus
        />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box p={3} textAlign="center">
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        ) : filteredItems.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary" variant="body2">
              {searchTerm ? 'No results found' : 'No items available'}
            </Typography>
          </Box>
        ) : (
          <List dense>
            {filteredItems.map((item) => {
              const accessibility = getAccessibilityInfo(item);
              const selected = isSelected(item);
              
              return (
                <ListItem
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: selected ? 'primary.50' : 'transparent',
                    '&:hover': {
                      backgroundColor: selected ? 'primary.100' : 'action.hover',
                    },
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={item.photoLink}
                      sx={{ width: 40, height: 40 }}
                    >
                      {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.firstName} {item.lastName}
                        {selected && (
                          <Chip
                            label="Selected"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        {item.email}
                        {accessibility && (
                          <div style={{ marginTop: 4 }}>
                            Accessibility: {accessibility.join(', ')}
                          </div>
                        )}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer */}
      {selectedItems.length > 0 && onRemove && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="textSecondary" gutterBottom>
            Selected ({selectedItems.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {selectedItems.map((item) => (
              <Chip
                key={item.id}
                label={`${item.firstName} ${item.lastName}`}
                size="small"
                onDelete={() => onRemove(item)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default SearchPopup;
