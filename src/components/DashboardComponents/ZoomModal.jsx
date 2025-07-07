// Enhanced ZoomModal.js with scrollable content support
import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    Box,
    Snackbar,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import * as htmlToImage from 'html-to-image';

const ZoomModal = ({
    open,
    onClose,
    title = 'Modal',
    maxWidth = 'lg',
    height = 500,
    children,
    enableDownload = false,
    downloadFileName = 'chart',
    enableScroll = true, // New prop to control scrolling
}) => {
    const chartRef = useRef(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [now, setNow] = useState(new Date());

    // Update the time every second while modal is open
    React.useEffect(() => {
        if (!open) return;
        setNow(new Date());
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, [open]);

    const handleDownload = async () => {
        if (chartRef.current) {
            try {
                const node = chartRef.current;
                
                // Enhanced options for better custom chart rendering
                const options = {
                    backgroundColor: '#ffffff',
                    width: node.offsetWidth,
                    height: node.offsetHeight,
                    style: {
                        width: node.offsetWidth + 'px',
                        height: node.offsetHeight + 'px',
                    },
                    // Improved settings for custom styled elements
                    pixelRatio: 2, // Higher quality
                    skipAutoScale: true,
                    // Include fonts and ensure text is rendered
                    fontEmbedCSS: true,
                    // Wait for fonts to load
                    skipFonts: false,
                    // Ensure all styles are captured
                    includeQueryParams: true,
                    // Better handling of gradients and backgrounds
                    cacheBust: true,
                    // Custom filter to ensure all elements are included
                    filter: (node) => {
                        // Include all nodes, don't filter anything out
                        return true;
                    }
                };

                // Method 1: Try html-to-image with enhanced options
                let dataUrl;
                try {
                    dataUrl = await htmlToImage.toPng(node, options);
                } catch (firstError) {
                    console.log('First method failed, trying alternative...', firstError);
                    
                    // Method 2: Alternative approach with different library method
                    try {
                        dataUrl = await htmlToImage.toJpeg(node, {
                            ...options,
                            quality: 0.95,
                            backgroundColor: '#ffffff'
                        });
                    } catch (secondError) {
                        console.log('Second method failed, trying canvas approach...', secondError);
                        
                        // Method 3: Canvas-based approach
                        dataUrl = await htmlToImage.toCanvas(node, options).then(canvas => {
                            return canvas.toDataURL('image/png');
                        });
                    }
                }

                // Download the image
                const link = document.createElement('a');
                link.download = `${downloadFileName}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setSnackbarOpen(true);
            } catch (error) {
                console.error('Failed to export image:', error);
                
                // Show error to user
                alert('Failed to download chart. Please try again or contact support.');
            }
        }
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose} 
                maxWidth={maxWidth} 
                fullWidth
                // Allow the dialog itself to be scrollable if content is too tall
                scroll="paper"
            >
                <DialogTitle sx={{ pr: 6 }}>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent
                    sx={{
                        // Remove default padding to give more control
                        p: 0,
                        // Enable scrolling on the dialog content
                        overflowY: enableScroll ? 'auto' : 'hidden',
                        overflowX: enableScroll ? 'auto' : 'hidden',
                    }}
                >
                    <Box
                        ref={chartRef}
                        sx={{
                            width: '100%',
                            minHeight: enableScroll ? 'auto' : 500,
                            height: enableScroll ? 'auto' : '70vh',
                            maxHeight: enableScroll ? 'none' : '80vh',
                            overflow: enableScroll ? 'visible' : 'hidden',
                            position: 'relative',
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            transform: 'translateZ(0)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            justifyContent: 'flex-start',
                            padding: 2, // Add some padding back
                        }}
                    >
                        {/* Title inside the image area */}
                        <Box
                            sx={{
                                width: '100%',
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: 22,
                                mb: 1,
                                mt: 1,
                                color: '#222',
                                fontFamily: 'inherit',
                                letterSpacing: 0.2,
                            }}
                        >
                            {title}
                        </Box>
                        {/* Date and time below the title */}
                        <Box
                            data-zoom-modal-time
                            sx={{
                                width: '100%',
                                textAlign: 'center',
                                color: '#555',
                                fontSize: 14,
                                mb: 2,
                                fontFamily: 'inherit',
                                fontWeight: 400,
                                letterSpacing: 0.1,
                                userSelect: 'none',
                            }}
                        >
                            Export Time:{now.toLocaleString()}
                        </Box>                        <Box 
                            sx={{ 
                                width: '100%', 
                                maxWidth: 1200, // Increase max width for wider charts
                                minWidth: 600, // Increase minimum width for better chart display
                                margin: '0 auto', // Center the chart
                                height: enableScroll ? 'auto' : 'calc(100% - 70px)', 
                                flex: enableScroll ? 'none' : 1, 
                                display: 'flex', 
                                alignItems: enableScroll ? 'flex-start' : 'stretch', 
                                justifyContent: 'center',
                                minHeight: enableScroll ? '400px' : 'auto', // Increase minimum height for better visibility
                            }}
                        >
                            {children}
                        </Box>
                    </Box>
                </DialogContent>

                {enableDownload && (
                    <DialogActions
                        sx={{
                            justifyContent: 'center',
                            pb: 3,
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                            sx={{
                                bgcolor: '#2B8C37',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: '#20662A',
                                },
                                minWidth: 200,
                                fontWeight: 600,
                                fontSize: 16,
                                boxShadow: 2,
                                borderRadius: 3,
                            }}
                        >
                            Download Image
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2500}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    The {title} chart was successfully downloaded!
                </Alert>
            </Snackbar>
        </>
    );
};

export default ZoomModal;