import { Paper } from '@mui/material';
import React, { useEffect, useState } from "react";
import api from "../../../services/api";

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
export default function InvestmentKPI({ year: yearProp, companyId }) {
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

    return (
        <div style={{ display: 'flex', gap: 8, width: '100%', marginBottom: 8, height: '100%', minHeight: 0 }}>
            {/* Health KPI */}
            <Paper
                elevation={0}
                sx={{
                    background: getColor('health'),
                    border: `2px solid ${getColor('health')}`,
                    borderRadius: '14px',
                    px: 3,
                    py: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: 'none',
                    width: '100%',
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                    textAlign: 'center',
                    flex: 1
                }}
            >
                <div
                style={{
                    fontSize: 22, 
                    fontWeight: 900,
                    marginBottom: 2,
                    textAlign: 'center',
                    color: '#182959',
                    letterSpacing: 0.5,
                    lineHeight: 1.1,
                }}
                >
                {data?.health?.toLocaleString?.('en-US', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }) ?? '₱0'}
                </div>
                <div
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#64748b',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    letterSpacing: 0.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
                >
                Health
                </div>
                <div
                    style={{
                        fontSize: 10,
                        color: '#94a3b8',
                        textAlign: 'center',
                        marginTop: 2,
                        width: '100%',
                        fontStyle: 'italic',
                        letterSpacing: 0.2,
                        fontWeight: 400,
                    }}
                >
                    {dates?.health && (
                        <>As of: {formatMonthYear(dates.health)}</>
                    )}
                </div>
            </Paper>
            {/* Education KPI */}
            <Paper
                elevation={0}
                sx={{
                    background: getColor('education'),
                    border: `2px solid ${getColor('education')}`,
                    borderRadius: '14px',
                    px: 3,
                    py: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: 'none',
                    width: '100%',
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                    textAlign: 'center',
                    flex: 1
                }}
            >
                <div
                style={{
                    fontSize: 22,
                    fontWeight: 900,
                    marginBottom: 2,
                    textAlign: 'center',
                    color: '#182959',
                    letterSpacing: 0.5,
                    lineHeight: 1.1,
                }}
                >
                {data?.education?.toLocaleString?.('en-US', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }) ?? '₱0'}
                </div>
                <div
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#64748b',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    letterSpacing: 0.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
                >
                Education
                </div>
                <div
                    style={{
                        fontSize: 10,
                        color: '#94a3b8',
                        textAlign: 'center',
                        marginTop: 2,
                        width: '100%',
                        fontStyle: 'italic',
                        letterSpacing: 0.2,
                        fontWeight: 400,
                    }}
                >
                    {dates?.education && (
                        <>As of: {formatMonthYear(dates.education)}</>
                    )}
                </div>
            </Paper>
            {/* Livelihood KPI */}
            <Paper
                elevation={0}
                sx={{
                    background: getColor('livelihood'),
                    border: `2px solid ${getColor('livelihood')}`,
                    borderRadius: '14px',
                    px: 3,
                    py: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: 'none',
                    width: '100%',
                    minWidth: 0,
                    minHeight: 0,
                    height: '100%',
                    textAlign: 'center',
                    flex: 1
                }}
            >
                <div
                style={{
                    fontSize: 22,
                    fontWeight: 900,
                    marginBottom: 2,
                    textAlign: 'center',
                    color: '#182959',
                    letterSpacing: 0.5,
                    lineHeight: 1.1,
                }}
                >
                {data?.livelihood?.toLocaleString?.('en-US', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }) ?? '₱0'}
                </div>
                <div
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#64748b',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    letterSpacing: 0.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
                >
                Livelihood
                </div>
                <div
                    style={{
                        fontSize: 10,
                        color: '#94a3b8',
                        textAlign: 'center',
                        marginTop: 2,
                        width: '100%',
                        fontStyle: 'italic',
                        letterSpacing: 0.2,
                        fontWeight: 400,
                    }}
                >
                    {dates?.livelihood && (
                        <>As of: {formatMonthYear(dates.livelihood)}</>
                    )}
                </div>
            </Paper>
        </div>
    );
}