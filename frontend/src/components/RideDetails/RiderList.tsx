import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Collapse,
  CardContent,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { Rider } from '../../types';
import styles from './RiderList.module.css';

interface RiderListProps {
  riders: Rider[];
  showAccessibility?: boolean;
  hideHeader?: boolean;
}

interface RiderCardProps {
  rider: Rider;
  showAccessibility?: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onRef?: (element: HTMLDivElement | null) => void;
}

const RiderCard: React.FC<RiderCardProps> = ({ rider, showAccessibility = false, expanded, onToggleExpanded, onRef }) => {

  return (
    <div ref={onRef} className={styles.riderCard}>
      {/* Compact View - Always Visible */}
      <div className={styles.compactView} onClick={onToggleExpanded}>
        <Avatar
          src={rider.photoLink}
          sx={{ width: 40, height: 40 }}
          className={styles.avatar}
        >
          {rider.firstName?.charAt(0)}{rider.lastName?.charAt(0)}
        </Avatar>

        <Box className={styles.compactInfo}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {rider.firstName} {rider.lastName}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            {rider.email ? rider.email.split('@')[0] : rider.id}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpanded();
          }}
          sx={{ ml: 'auto' }}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>

      {/* Expanded View - Collapsible */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 1, pb: 2 }}>

          {/* Contact Information */}
          <div className={styles.contactInfo}>
            {rider.phoneNumber && (
              <div className={styles.contactRow}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {rider.phoneNumber}
                </Typography>
              </div>
            )}
            {rider.email && (
              <div className={styles.contactRow}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {rider.email}
                </Typography>
              </div>
            )}
          </div>

          {/* Accessibility needs */}
          {showAccessibility && rider.accessibility && rider.accessibility.length > 0 && (
            <div className={styles.accessibilitySection}>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem', mt: 2 }}>
                Accessibility Needs
              </Typography>
              <div className={styles.accessibilityChips}>
                {rider.accessibility.map((need: string) => (
                  <Chip
                    key={need}
                    label={need}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', height: 24 }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Additional rider information */}
          {rider.organization && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Organization: {rider.organization}
            </Typography>
          )}
        </CardContent>
      </Collapse>
    </div>
  );
};

const RiderList: React.FC<RiderListProps> = ({ riders, showAccessibility = false, hideHeader = false }) => {
  const [expandedRiderId, setExpandedRiderId] = useState<string | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const setCardRef = useCallback((riderId: string) => (element: HTMLDivElement | null) => {
    cardRefs.current[riderId] = element;
  }, []);

  const handleToggleExpanded = (riderId: string) => {
    const wasExpanded = expandedRiderId === riderId;
    setExpandedRiderId(wasExpanded ? null : riderId);
    
    // Auto-scroll to the expanded card after a short delay to allow the collapse animation to start
    if (!wasExpanded) {
      setTimeout(() => {
        const cardElement = cardRefs.current[riderId];
        if (cardElement) {
          cardElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100); // Small delay to allow the collapse animation to start
    }
  };

  if (!riders || riders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Typography variant="body1" color="textSecondary">
          No riders assigned
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.riderList}>
      {!hideHeader && (
        <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 600 }}>
          {riders.length} Rider{riders.length !== 1 ? 's' : ''}
        </Typography>
      )}

      <div className={styles.riderCards}>
        {riders.map((rider) => (
          <RiderCard
            key={rider.id}
            rider={rider}
            showAccessibility={showAccessibility}
            expanded={expandedRiderId === rider.id}
            onToggleExpanded={() => handleToggleExpanded(rider.id)}
            onRef={setCardRef(rider.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default RiderList;