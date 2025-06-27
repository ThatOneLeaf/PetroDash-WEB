import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const CO2Context = createContext();

export const useCO2 = () => {
  const context = useContext(CO2Context);
  if (!context) {
    throw new Error('useCO2 must be used within a CO2Provider');
  }
  return context;
};

export const CO2Provider = ({ children }) => {
  const [totalCO2Avoided, setTotalCO2Avoided] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch public CO2 data for the widget (without authentication)
  const fetchPublicCO2Data = useCallback(async () => {
    try {
      const response = await api.get('/energy/energy_dashboard');
      const data = response.data;
      const energyData = data?.energy_data || {};
      const totalCO2 = energyData?.totals?.total_co2_avoidance || 0;
      
      if (totalCO2 > 0) {
        const updatedTime = new Date();
        setTotalCO2Avoided(totalCO2);
        setLastUpdated(updatedTime);
      }
    } catch (error) {
      console.error('Could not fetch public CO2 data:', error.message);
      // Keep existing values or set defaults
    }
  }, []);

  // Automatically fetch public data when provider mounts
  useEffect(() => {
    fetchPublicCO2Data();
  }, [fetchPublicCO2Data]);

  const updateCO2Data = useCallback((co2Value, updatedTime) => {
    setTotalCO2Avoided(co2Value || 0);
    setLastUpdated(updatedTime || new Date());
  }, []);

  const value = {
    totalCO2Avoided,
    lastUpdated,
    updateCO2Data,
    fetchPublicCO2Data, // Expose this for manual refresh if needed
  };

  return (
    <CO2Context.Provider value={value}>
      {children}
    </CO2Context.Provider>
  );
};
