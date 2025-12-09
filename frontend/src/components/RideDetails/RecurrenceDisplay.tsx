import React from 'react';
import { Box, Typography, Chip, Card, CardContent } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { RideType } from '@carriage-web/shared/src/types/ride';

interface RecurrenceDisplayProps {
  ride: RideType;
  showForRole: boolean;
}

// Enhanced RRULE parsing for better display
const parseRecurrenceRule = (
  rrule: string
): { summary: string; details: string[] } => {
  const parts = rrule.toUpperCase().split(';');
  const ruleMap: { [key: string]: string } = {};

  parts.forEach((part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      ruleMap[key] = value;
    }
  });

  const freq = ruleMap['FREQ'];
  const interval = ruleMap['INTERVAL'] ? parseInt(ruleMap['INTERVAL']) : 1;
  const byWeekDay = ruleMap['BYDAY'];
  const byMonthDay = ruleMap['BYMONTHDAY'];
  const count = ruleMap['COUNT'] ? parseInt(ruleMap['COUNT']) : null;
  const until = ruleMap['UNTIL'];

  let summary = 'Custom recurrence';
  const details: string[] = [];

  switch (freq) {
    case 'DAILY':
      if (interval === 1) {
        summary = 'Daily';
        details.push('Every day');
      } else {
        summary = `Every ${interval} days`;
        details.push(`Repeats every ${interval} days`);
      }
      break;

    case 'WEEKLY':
      if (interval === 1) {
        if (byWeekDay) {
          const days = byWeekDay.split(',').map((day) => {
            const dayMap: { [key: string]: string } = {
              MO: 'Monday',
              TU: 'Tuesday',
              WE: 'Wednesday',
              TH: 'Thursday',
              FR: 'Friday',
              SA: 'Saturday',
              SU: 'Sunday',
            };
            return dayMap[day] || day;
          });
          summary = `Weekly on ${days.join(', ')}`;
          details.push(`Every ${days.join(', ')}`);
        } else {
          summary = 'Weekly';
          details.push('Every week');
        }
      } else {
        summary = `Every ${interval} weeks`;
        details.push(`Repeats every ${interval} weeks`);
        if (byWeekDay) {
          const days = byWeekDay
            .split(',')
            .map((day) => day.replace(/[+-]?\d+/, ''));
          details.push(`On ${days.join(', ')}`);
        }
      }
      break;

    case 'MONTHLY':
      if (byMonthDay) {
        summary = `Monthly on day ${byMonthDay}`;
        details.push(
          `Every month on the ${byMonthDay}${getOrdinalSuffix(
            parseInt(byMonthDay)
          )}`
        );
      } else {
        summary = 'Monthly';
        details.push('Every month');
      }
      break;

    case 'YEARLY':
      summary = 'Yearly';
      details.push('Every year');
      break;
  }

  if (count) {
    details.push(`For ${count} occurrences`);
  } else if (until) {
    const endDate = new Date(until);
    details.push(`Until ${endDate.toLocaleDateString()}`);
  }

  return { summary, details };
};

const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const RecurrenceDisplay: React.FC<RecurrenceDisplayProps> = ({
  ride,
  showForRole,
}) => {
  if (!showForRole || !ride.isRecurring || !ride.rrule) {
    return null;
  }

  const { summary, details } = parseRecurrenceRule(ride.rrule);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <RepeatIcon color="primary" sx={{ mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Recurring Ride
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={summary}
                color="primary"
                variant="outlined"
                size="medium"
                icon={<EventRepeatIcon />}
              />

              {ride.parentRideId && ride.recurrenceId && (
                <Chip
                  label="Part of Series"
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            {details.length > 0 && (
              <Box>
                {details.map((detail, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    color="textSecondary"
                    sx={{ lineHeight: 1.4 }}
                  >
                    • {detail}
                  </Typography>
                ))}
              </Box>
            )}

            {/* Show excluded dates if any */}
            {ride.exdate && ride.exdate.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Excluded dates:{' '}
                  {ride.exdate
                    .map((date) => new Date(date).toLocaleDateString())
                    .join(', ')}
                </Typography>
              </Box>
            )}

            {/* Show additional dates if any */}
            {ride.rdate && ride.rdate.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Additional dates:{' '}
                  {ride.rdate
                    .map((date) => new Date(date).toLocaleDateString())
                    .join(', ')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecurrenceDisplay;
