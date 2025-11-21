import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  CircularProgress,
  Paper,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
  SearchableType,
  getSearchConfig,
  filterItems,
} from '../../utils/searchConfig';

interface SearchPopupProps<T extends { id: string | number }> {
  open: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  items: T[];
  searchType: SearchableType;
  loading?: boolean;
  error?: string | null;
  title: string;
  placeholder?: string;
  selectedItems?: T[];
  onRemove?: (item: T) => void;
  showAccessibility?: boolean;
  anchorEl?: HTMLElement | null;
}

const SearchPopup = <T extends { id: string | number }>({
  open,
  onClose,
  onSelect,
  items,
  searchType,
  loading = false,
  error,
  title,
  placeholder = 'Search...',
  selectedItems = [],
  onRemove,
  showAccessibility = false,
  anchorEl,
}: SearchPopupProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);

  const searchConfig = getSearchConfig<T>(searchType);

  // Filter items based on search term
  useEffect(() => {
    const filtered = filterItems(items, searchTerm, searchConfig);
    setFilteredItems(filtered);
  }, [items, searchTerm, searchConfig]);

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
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onClose, anchorEl]);

  const handleItemClick = (item: T) => {
    onSelect(item);
    setSearchTerm('');
  };

  const isSelected = (item: T) => {
    return selectedItems.some((selected) => selected.id === item.id);
  };

  if (!open) return null;

  const popupContent = (
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
              const selected = isSelected(item);
              const renderedItem = searchConfig.renderItem(
                item,
                selected,
                showAccessibility
              );

              return (
                <ListItem
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: selected ? 'primary.50' : 'transparent',
                    '&:hover': {
                      backgroundColor: selected
                        ? 'primary.100'
                        : 'action.hover',
                    },
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <ListItemAvatar>{renderedItem.avatar}</ListItemAvatar>
                  <ListItemText
                    primary={renderedItem.primary}
                    secondary={renderedItem.secondary}
                  />
                  {renderedItem.chips}
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
                label={searchConfig.getItemLabel(item)}
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

  // Render as portal to avoid affecting document flow
  return createPortal(popupContent, document.body);
};

export default SearchPopup;
