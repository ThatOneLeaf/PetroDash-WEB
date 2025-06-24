import React, { useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import profileIcon from "../../assets/Icons/user-picture.svg";
import editIcon from "../../assets/Icons/edit.svg";
import dashboardIcon from "../../assets/Icons/dashboard.svg";
import energyIcon from "../../assets/Icons/energy.svg";
import economicsIcon from "../../assets/Icons/economics.svg";
import environmentIcon from "../../assets/Icons/environment.svg";
import socialIcon from "../../assets/Icons/social.svg";
import { Box, Typography, Avatar, Button, Slider, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem } from "@mui/material";
import Sidebar from "../../components/Sidebar";
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import BarChartIcon from '@mui/icons-material/BarChart';
import Cropper from 'react-easy-crop';

const modules = [
  { label: "Overview", icon: <BarChartIcon sx={{ color: '#388E3C', width: 32, height: 32 }} />, key: "overview" },
  { label: "Energy", icon: energyIcon, color: "#388E3C", key: "energy" },
  { label: "Economic", icon: economicsIcon, color: "#388E3C", key: "economic" },
  { label: "Environment", icon: environmentIcon, color: "#5A5A5A", key: "environment" },
  { label: "Social", icon: socialIcon, color: "#BDBDBD", key: "social" },
];

const moduleCardColor = "#16275B";

export default function ProfilePage() {
  const { user, getUserRoleName, getUserEmail } = useAuth();
  const accessibleModules = modules;

  // Profile image state
  const [profileImg, setProfileImg] = useState(null);
  const [openCrop, setOpenCrop] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const inputFileRef = useRef();

  // Dropdown state for Edit Profile
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // Helper function to determine module type based on user access and role
  function getModuleTypeForUser(mod, user) {
    const role = user?.roles?.[0];
    // Overview (Dashboard) access: R02, R03, R04
    if (mod.key === 'overview' && ['R02', 'R03', 'R04'].includes(role)) return 'Dashboard';
    // Energy Dashboard: R04, R03, R02
    if (mod.key === 'energy' && ['R04', 'R03', 'R02'].includes(role)) return 'Dashboard';
    // Economic Repository: R05, R04, R03
    if (mod.key === 'economic' && ['R05', 'R04', 'R03'].includes(role)) return 'Repository';
    // Environment Repository: R05, R04, R03
    if (mod.key === 'environment' && ['R05', 'R04', 'R03'].includes(role)) return 'Repository';
    // Social Repository: R05, R04, R03
    if (mod.key === 'social' && ['R05', 'R04', 'R03'].includes(role)) return 'Repository';
    // If user has both dashboard and repository access for a module (rare, but possible)
    if (mod.key === 'overview' && ['R02', 'R03', 'R04'].includes(role) && ['R05', 'R04', 'R03'].includes(role)) {
      return 'Dashboard & Repository';
    }
    return '';
  }

  // Handle file input change
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImg(reader.result);
        setOpenCrop(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Crop complete handler
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Get cropped image
  async function getCroppedImg(imageSrc, cropPixels) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, 'image/jpeg');
    });
  }

  // Helper to create image
  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
  }

  // Save cropped image
  const handleCropSave = async () => {
    const croppedUrl = await getCroppedImg(selectedImg, croppedAreaPixels);
    setProfileImg(croppedUrl);
    localStorage.setItem("profileImg", croppedUrl); // Save to localStorage for sidebar
    setOpenCrop(false);
    setSelectedImg(null);
  };

  // Remove profile image
  const handleRemoveImg = () => {
    setProfileImg(null);
    localStorage.removeItem("profileImg"); // Remove from localStorage for sidebar
    setOpenCrop(false);
    setSelectedImg(null);
  };

  // Only update preview if user is cropping or removing, not on every file select
  React.useEffect(() => {
    const storedImg = localStorage.getItem("profileImg");
    if (storedImg && !profileImg) {
      setProfileImg(storedImg);
    }
  }, [profileImg]);

  // Dropdown menu handlers
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleEditPicture = () => {
    inputFileRef.current.click();
    handleMenuClose();
  };
  const handleRemovePicture = () => {
    handleRemoveImg();
    handleMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: "#fff", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flex: 1, p: 4, position: 'relative' }}>
        {/* Edit Profile Button - Top Right, smaller */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#16275B" }}>
            User Profile
          </Typography>
          <>
            <Button
              variant="text"
              onClick={handleMenuClick}
              sx={{
                color: '#5A5A5A',
                fontWeight: 700,
                fontSize: 15,
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0,
                minWidth: 0,
                letterSpacing: 0.5,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
              }}
            >
              <img src={editIcon} alt="Edit" style={{ width: 16, height: 16, marginRight: 5 }} />
              EDIT PROFILE
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { borderRadius: 2, minWidth: 180, mt: 1 } }}
            >
              <MenuItem onClick={handleEditPicture}>Update/Change Profile Picture</MenuItem>
              {profileImg && <MenuItem onClick={handleRemovePicture} sx={{ color: 'error.main' }}>Remove Profile Picture</MenuItem>}
            </Menu>
          </>
        </Box>
        <input
          type="file"
          accept="image/*"
          ref={inputFileRef}
          style={{ display: 'none' }}
          onChange={onSelectFile}
        />
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
          <Avatar 
            src={profileImg || profileIcon} 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: "#16275B", 
              mb: 1, 
              border: '3px solid #388E3C', 
              boxShadow: '0 2px 8px #0001' 
            }} 
          />
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 700, color: "#16275B" }}>
            {getUserEmail() || "No Email"}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#5A5A5A" }}>
            {getUserRoleName() || "No Role"}
          </Typography>
        </Box>
        {/* Crop Dialog - improved theme */}
        <Dialog open={openCrop} onClose={() => setOpenCrop(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: '#f5f7fa' } }}>
          <DialogTitle sx={{ bgcolor: '#16275B', color: '#fff', fontWeight: 700, fontSize: 20, textAlign: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>Edit Profile Picture</DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ position: 'relative', width: '100%', height: 260, bgcolor: '#e3eafc', borderRadius: 3, boxShadow: 1, mb: 2, overflow: 'hidden' }}>
              {selectedImg && (
                <Cropper
                  image={selectedImg}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                  showGrid={false}
                  style={{
                    containerStyle: { background: '#e3eafc' },
                    cropAreaStyle: { border: '2px solid #16275B' },
                  }}
                />
              )}
            </Box>
            <Typography sx={{ color: '#16275B', fontWeight: 500, mb: 1, fontSize: 14 }}>Zoom</Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e, z) => setZoom(z)}
              sx={{ color: '#388E3C' }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Button onClick={() => setOpenCrop(false)} sx={{ color: '#5A5A5A', fontWeight: 600 }}>Cancel</Button>
            <Button onClick={handleCropSave} variant="contained" sx={{ bgcolor: '#388E3C', fontWeight: 700, '&:hover': { bgcolor: '#2e7031' } }}>Save</Button>
          </DialogActions>
        </Dialog>
        {/* Accessible Modules Section */}
        <Box sx={{ mt: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#16275B", mb: 2 }}>
            Accessible Modules
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
            {accessibleModules.map((mod) => (
              <Box
                key={mod.key}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  bgcolor: moduleCardColor,
                  color: "#fff",
                  borderRadius: 4,
                  px: 4,
                  py: 2,
                  minWidth: 140,
                  minHeight: 110,
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: "0 2px 12px #0002",
                  opacity: 0.92,
                  transition: "transform 0.2s",
                  '&:hover': { transform: 'scale(1.04)', boxShadow: '0 4px 20px #0003' },
                }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  marginBottom: 10
                }}>
                  {mod.key === 'overview' ? mod.icon : <img src={mod.icon} alt={mod.label} style={{ width: 32, height: 32 }} />}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{mod.label}</span>
                <Typography variant="caption" sx={{ mt: 0.5, color: "#e0e0e0", fontWeight: 400 }}>
                  {getModuleTypeForUser(mod, user)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
