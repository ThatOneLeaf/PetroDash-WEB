    // ZoomModal.js (full file with reusable modal state logic)
    import React, { useRef } from 'react';
    import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    Box,
    } from '@mui/material';
    import CloseIcon from '@mui/icons-material/Close';
    import DownloadIcon from '@mui/icons-material/Download';
    //import * as htmlToImage from 'html-to-image';

    const ZoomModal = ({
    open,
    onClose,
    title = 'Modal',
    maxWidth = 'lg',
    height = 500,
    children,
    enableDownload = false,
    downloadFileName = 'chart',
    }) => {
    const chartRef = useRef(null);

    const handleDownload = async () => {
        if (chartRef.current) {
        try {
            const dataUrl = await htmlToImage.toPng(chartRef.current, {
            backgroundColor: '#ffffff',
            });
            const link = document.createElement('a');
            link.download = `${downloadFileName}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to export image', error);
        }
        }
    };

    return (
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
                width: '100%',
                height,
                overflow: 'hidden',
                bgcolor: '#ffffff',
            }}
            >
            {children}
            </Box>
        </DialogContent>

        {enableDownload && (
            <DialogActions>
            <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
            >
                Download Image
            </Button>
            </DialogActions>
        )}
        </Dialog>
    );
    };

    export default ZoomModal;

    // To use this modal in a page/component:
    // const [zoomModal, setZoomModal] = useState({ open: false, content: null, title: '', fileName: '' });
    // const openZoomModal = (title, fileName, content) => setZoomModal({ open: true, title, fileName, content });
    // <ZoomModal {...zoomModal} onClose={() => setZoomModal({ ...zoomModal, open: false })} enableDownload />
