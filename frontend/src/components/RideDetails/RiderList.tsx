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
import { RiderType } from '@carriage-web/shared/types/rider';

interface RiderListProps {
  riders: RiderType[];
  showAccessibility?: boolean;
  hideHeader?: boolean;
}

interface RiderCardProps {
  rider: RiderType;
  showAccessibility?: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onRef?: (element: HTMLDivElement | null) => void;
}

const RiderCard: React.FC<RiderCardProps> = ({
  rider,
  showAccessibility = false,
  expanded,
  onToggleExpanded,
  onRef,
}) => {
  return (
    <div
      ref={onRef}
      className="border border-[#e0e0e0] rounded-lg bg-[#fafafa] overflow-hidden transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
    >
      {/* Compact View - Always Visible */}
      <div
        className="flex items-center px-4 py-3 cursor-pointer transition-colors duration-200 min-h-16 hover:bg-[#f0f0f0] max-md:px-3 max-md:py-2.5 max-md:min-h-14"
        onClick={onToggleExpanded}
      >
        <Avatar
          src={rider.photoLink}
          sx={{ width: 40, height: 40 }}
          className="mr-3 shrink-0 max-md:mr-2.5"
        >
          {rider.firstName?.charAt(0)}
          {rider.lastName?.charAt(0)}
        </Avatar>

        <Box className="flex-1 min-w-0">
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {rider.firstName} {rider.lastName.charAt(0)}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: '0.85rem' }}
          >
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
          <div className="flex flex-col gap-2 my-3">
            {rider.phoneNumber && (
              <div className="flex items-center gap-2">
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">{rider.phoneNumber}</Typography>
              </div>
            )}
            {rider.email && (
              <div className="flex items-center gap-2">
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{rider.email}</Typography>
              </div>
            )}
          </div>

          {/* Accessibility needs */}
          {showAccessibility &&
            rider.accessibility &&
            rider.accessibility.length > 0 && (
              <div className="border-t border-[#e0e0e0] mt-4 pt-3">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ fontSize: '0.85rem', mt: 2 }}
                >
                  Accessibility Needs
                </Typography>
                <div className="flex flex-wrap gap-1.5 mt-2 max-md:gap-1">
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

const RiderList: React.FC<RiderListProps> = ({
  riders,
  showAccessibility = false,
  hideHeader = false,
}) => {
  const [expandedRiderId, setExpandedRiderId] = useState<string | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const setCardRef = useCallback(
    (riderId: string) => (element: HTMLDivElement | null) => {
      cardRefs.current[riderId] = element;
    },
    []
  );

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
            inline: 'nearest',
          });
        }
      }, 100); // Small delay to allow the collapse animation to start
    }
  };

  if (!riders || riders.length === 0) {
    return (
      <div className="flex items-center h-full justify-center bg-[#f5f5f5] border border-dashed border-[#ccc] rounded-lg">
        <Typography variant="body1" color="textSecondary">
          No riders assigned
        </Typography>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:thin] [scrollbar-color:#bbb_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#bbb] [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb:hover]:bg-[#999] max-md:min-h-20 max-md:max-h-62.5">
      {!hideHeader && (
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 600 }}
        >
          {riders.length} Rider{riders.length !== 1 ? 's' : ''}
        </Typography>
      )}

      <div className="flex flex-col gap-2 max-md:gap-1.5">
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
