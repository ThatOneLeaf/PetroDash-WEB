// ZoomModal.js (full file with reusable modal state logic)
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
    maxWidth = 'sm', // changed from 'md' to 'sm'
    height = 400,
    children,
    enableDownload = false,
    downloadFileName = 'chart',
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
                // Clone the chart node including the time overlay
                const node = chartRef.current;
                const clone = node.cloneNode(true);

                // Copy computed styles for all children (for accurate rendering)
                const copyStyles = (sourceElem, targetElem) => {
                    const computedStyle = window.getComputedStyle(sourceElem);
                    for (let key of computedStyle) {
                        targetElem.style[key] = computedStyle.getPropertyValue(key);
                    }
                    Array.from(sourceElem.children).forEach((srcChild, i) => {
                        if (targetElem.children[i]) copyStyles(srcChild, targetElem.children[i]);
                    });
                };
                copyStyles(node, clone);

                // Update the overlay in the clone to show date and time
                const overlay = clone.querySelector('[data-zoom-modal-time]');
                if (overlay) {
                    overlay.innerText = now.toLocaleString();
                }

                // Wrap clone in a container for absolute positioning
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.width = node.offsetWidth + 'px';
                container.style.height = node.offsetHeight + 'px';
                clone.style.width = '100%';
                clone.style.height = '100%';
                container.appendChild(clone);

                // Convert container to image
                const dataUrl = await htmlToImage.toPng(container, {
                    backgroundColor: '#ffffff',
                    width: node.offsetWidth,
                    height: node.offsetHeight,
                    style: {
                        width: node.offsetWidth + 'px',
                        height: node.offsetHeight + 'px',
                    },
                });
                const link = document.createElement('a');
                link.download = `${downloadFileName}.png`;
                link.href = dataUrl;
                link.click();
                setSnackbarOpen(true);
            } catch (error) {
                console.error('Failed to export image', error);
            }
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
                <DialogTitle sx={{ pr: 6 }}>
                    {title}
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

                <DialogContent dividers>
                    <Box
                        ref={chartRef}
                        sx={{
                            width: '75%', // reduced from '100%' to 75%
                            height,
                            overflow: 'hidden',
                            bgcolor: '#ffffff',
                            position: 'relative',
                            margin: '0 auto', // center the box
                        }}
                    >
                        {/* Subtle time overlay in modal */}
                        <Box
                            data-zoom-modal-time
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 16,
                                background: 'rgba(0,0,0,0.15)',
                                color: '#fff',
                                fontSize: 13,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                zIndex: 10,
                                pointerEvents: 'none',
                                fontFamily: 'inherit',
                                fontWeight: 400,
                                letterSpacing: 0.1,
                                userSelect: 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            {now.toLocaleTimeString()}
                        </Box>
                        {children}
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
                                minWidth: 140, // reduced from 200
                                fontWeight: 600,
                                fontSize: 16,
                                boxShadow: 2,
                                borderRadius: 3, // rounder corners
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
                    The {title} Chart successfully downloaded!
                </Alert>
            </Snackbar>
        </>
    );
};

export default ZoomModal;

// No changes needed here, as the modal is opened by parent via props.
    // const [zoomModal, setZoomModal] = useState({ open: false, content: null, title: '', fileName: '' });
    // const openZoomModal = (title, fileName, content) => setZoomModal({ open: true, title, fileName, content });
    // <ZoomModal {...zoomModal} onClose={() => setZoomModal({ ...zoomModal, open: false })} enableDownload />
