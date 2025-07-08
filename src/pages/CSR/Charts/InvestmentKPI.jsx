import { Paper } from '@mui/material';
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';

// Map program/project to color
const PROGRAM_COLORS = {
    health: '#f8bcbc',
    education: '#b6d4f7',
    livelihood: '#fff3b0',
    // Add more mappings if needed
};

// Helper to get color by program
const getColor = (program) => PROGRAM_COLORS[program?.toLowerCase?.()] || '#e2e8f0';

// Accept year and company as props
export default function InvestmentKPI({ year: yearProp, companyId, isInDashboard }) {
    const [availableYears, setAvailableYears] = useState();
    const [data, setData] = useState({});
    const [dates, setDates] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api
        .get("/help/activities")
        .then((res) => {
            const years = Array.from(
            new Set((res.data || []).map((item) => item.projectYear))
            ).filter(Boolean);
            years.sort((a, b) => b - a); // Descending
            setAvailableYears(years);
        })
        .catch(() => setAvailableYears([]));
    }, [yearProp]);

    useEffect(() => {
        setLoading(true);
        api
        .get("/help/investments-per-program", {
            params: {
                ...(yearProp ? { year: yearProp } : {}),
                ...(companyId ? { company_id: companyId } : {}),
            },
        })
        .then((res) => {
            const arr = Array.isArray(res.data) ? res.data : [];
            const obj = arr.reduce((acc, curr) => {
                if (curr.programName && typeof curr.projectExpenses === 'number') {
                    acc[curr.programName.toLowerCase()] = curr.projectExpenses;
                }
                return acc;
            }, {});
            const dateObj = arr.reduce((acc, curr) => {
                if (curr.programName && curr.dateUpdated) {
                    acc[curr.programName.toLowerCase()] = curr.dateUpdated;
                }
                return acc;
            }, {});
            setData(obj);
            setDates(dateObj);
        })
        .catch(() => {
            setData({});
            setDates({});
        })
        .finally(() => setLoading(false));
    }, [yearProp, companyId]);



    if (loading) {
        return (
            <div style={{ display: 'flex', gap: 16, width: '100%', marginBottom: 24, justifyContent: 'center', alignItems: 'center', minHeight: 0, height: '100%' }}>
                Loading...
            </div>
        );
    }

    // Helper to format date as MONTH-YEAR
    const formatMonthYear = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return `${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
    };

    // Helper to get icon color by program (deep version of pastel)
    const PROGRAM_ICON_COLORS = {
        health: '#b91c1c',      // deep red for pastel pink
        education: '#1e3a8a',  // deep blue for pastel blue
        livelihood: '#b45309', // deep gold/brown for pastel yellow
    };
    const getIconColor = (program) => PROGRAM_ICON_COLORS[program?.toLowerCase?.()] || '#334155';

    // Responsive KPI card layout: max width, min width, gap, and smaller padding
    return (
        <div
            style={{
                display: 'flex',
                gap: isInDashboard ? 16 : 8,
                width: '100%',
                height: isInDashboard ? '100%' : 'auto',
                margin: 0,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: isInDashboard ? 0 : '8px'
            }}
        >
            {/* Health KPI */}
            <Paper
                elevation={0}
                sx={{
                    background: getColor('health'),
                    border: `2px solid ${getColor('health')}`,
                    borderRadius: '14px',
                    px: { xs: 1.5, sm: 2, md: 3 },
                    py: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: 'none',
                    width: '100%',
                    minWidth: { xs: '100%', sm: '30%' },
                    height: isInDashboard ? '100%' : '100px',
                    textAlign: 'center',
                    flex: { xs: '1 1 100%', sm: '1 1 0' },
                    maxWidth: { xs: '100%', sm: '33.33%' },
                    minHeight: isInDashboard ? '120px' : '100px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', gap: 8 }}>
                    <HealthAndSafetyIcon sx={{ fontSize: 32, color: getIconColor('health') }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div
                            style={{
                                fontSize: "clamp(1rem, 3vw, 1.5rem)",
                                fontWeight: 900,
                                marginBottom: 2,
                                textAlign: "center",
                                color: "#182959",
                                letterSpacing: 0.5,
                                lineHeight: 1.1,
                            }}
                        >
                            {data?.health?.toLocaleString?.('en-US', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }) ?? '₱0'}
                        </div>
                        <div
                            style={{
                                fontSize: "clamp(0.6rem, 1.5vw, 1rem)",
                                fontWeight: 700,
                                color: "#222",
                                textAlign: "center",
                                lineHeight: 1.2,
                                letterSpacing: 0.2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            Health
                        </div>
                    </div>
                </div>
            </Paper>
            {/* Education KPI */}
            <Paper
                elevation={0}
                sx={{
                    background: getColor('education'),
                    border: `2px solid ${getColor('education')}`,
                    borderRadius: '14px',
                    px: { xs: 1.5, sm: 2, md: 3 },
                    py: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: 'none',
                    width: '100%',
                    minWidth: { xs: '100%', sm: '30%' },
                    height: isInDashboard ? '100%' : '100px',
                    textAlign: 'center',
                    flex: { xs: '1 1 100%', sm: '1 1 0' },
                    maxWidth: { xs: '100%', sm: '33.33%' },
                    minHeight: isInDashboard ? '120px' : '100px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', gap: 8 }}>
                    <SchoolIcon sx={{ fontSize: 32, color: getIconColor('education') }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div
                            style={{
                                fontSize: "clamp(1rem, 3vw, 1.5rem)",
                                fontWeight: 900,
                                marginBottom: 2,
                                textAlign: "center",
                                color: "#182959",
                                letterSpacing: 0.5,
                                lineHeight: 1.1,
                            }}
                        >
                            {data?.education?.toLocaleString?.('en-US', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }) ?? '₱0'}
                        </div>
                        <div
                            style={{
                                fontSize: "clamp(0.6rem, 1.5vw, 1rem)",
                                fontWeight: 700,
                                color: "#222",
                                textAlign: "center",
                                lineHeight: 1.2,
                                letterSpacing: 0.2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            Education
                        </div>
                    </div>
                </div>
            </Paper>
            {/* Livelihood KPI */}
            <Paper
                elevation={0}
                sx={{
                    background: getColor('livelihood'),
                    border: `2px solid ${getColor('livelihood')}`,
                    borderRadius: '14px',
                    px: { xs: 1.5, sm: 2, md: 3 },
                    py: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: 'none',
                    width: '100%',
                    minWidth: { xs: '100%', sm: '30%' },
                    height: isInDashboard ? '100%' : '100px',
                    textAlign: 'center',
                    flex: { xs: '1 1 100%', sm: '1 1 0' },
                    maxWidth: { xs: '100%', sm: '33.33%' },
                    minHeight: isInDashboard ? '120px' : '100px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', gap: 8 }}>
                    <WorkIcon sx={{ fontSize: 32, color: getIconColor('livelihood') }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div
                            style={{
                                fontSize: "clamp(1rem, 3vw, 1.5rem)",
                                fontWeight: 900,
                                marginBottom: 2,
                                textAlign: "center",
                                color: "#182959",
                                letterSpacing: 0.5,
                                lineHeight: 1.1,
                            }}
                        >
                            {data?.livelihood?.toLocaleString?.('en-US', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }) ?? '₱0'}
                        </div>
                        <div
                            style={{
                                fontSize: "clamp(0.6rem, 1.5vw, 1rem)",
                                fontWeight: 700,
                                color: "#222",
                                textAlign: "center",
                                lineHeight: 1.2,
                                letterSpacing: 0.2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            Livelihood
                        </div>
                        <div
                            style={{
                                fontSize: "clamp(0.5rem, 1vw, 0.8rem)",
                                color: "#374151",
                                textAlign: "center",
                                marginTop: 2,
                                width: "100%",
                                fontStyle: "italic",
                                letterSpacing: 0.2,
                                fontWeight: 400,
                            }}
                        >   
                        </div>
                    </div>
                </div>
            </Paper>
        </div>
    );
}