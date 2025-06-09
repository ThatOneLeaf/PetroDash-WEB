import { useEffect, useRef, useState } from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';

function FormModal({ title, subtitle, children, actions, onClose, width = '600px', hideCancel }) {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const [titleLines, setTitleLines] = useState(1);
  const [subtitleLines, setSubtitleLines] = useState(1);

  useEffect(() => {
    if (titleRef.current) {
      const lineHeight = parseFloat(getComputedStyle(titleRef.current).lineHeight);
      setTitleLines(Math.round(titleRef.current.scrollHeight / lineHeight));
    }
    if (subtitleRef.current) {
      const lineHeight = parseFloat(getComputedStyle(subtitleRef.current).lineHeight);
      setSubtitleLines(Math.round(subtitleRef.current.scrollHeight / lineHeight));
    }
  }, [title, subtitle]);

  return (
    <Paper
      sx={{
        p: 4,
        width,
        borderRadius: '16px',
        bgcolor: 'white',
      }}
    >
      <Box sx={{ mb: 3 }}>
        {title && (
          <Typography
            ref={titleRef}
            sx={{
              fontSize: titleLines > 1 ? '0.9rem' : '1rem',
              fontWeight: 800,
              lineHeight: 1.2,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            {title}
          </Typography>
        )}

        {subtitle && (
          <Typography
            ref={subtitleRef}
            sx={{
              fontSize: subtitleLines > 1 ? '1.6rem' : '2.2rem',
              color: '#182959',
              fontWeight: 800,
              lineHeight: 1.2,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 2 }}>{children}</Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
        {actions}
      </Box>
    </Paper>
  );
}

export default FormModal;
