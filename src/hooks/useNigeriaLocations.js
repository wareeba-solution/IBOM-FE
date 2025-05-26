// src/hooks/useNigeriaLocations.js
import { useState, useEffect } from 'react';
import NaijaStates from '../data/nigeriaStatesLGAs';

/**
 * Custom hook for managing Nigerian states, LGAs, and their relationships
 * @returns {Object} State and LGA data and utility functions
 */
const useNigeriaLocations = () => {
  // State variables
  const [statesList, setStatesList] = useState([]);
  const [allLGAs, setAllLGAs] = useState([]);
  const [stateLGAs, setStateLGAs] = useState([]);
  const [selectedState, setSelectedState] = useState('');

  // Initialize states and all LGAs on component mount
  useEffect(() => {
    try {
      // Get all states
      const states = NaijaStates.states();
      setStatesList(states);
      
      // Get all LGAs for all states
      const lgaList = [];
      states.forEach(state => {
        try {
          const stateLGAs = NaijaStates.lgas(state);
          lgaList.push(...stateLGAs);
        } catch (error) {
          console.error(`Error loading LGAs for ${state}:`, error);
        }
      });
      
      // Remove duplicates and sort
      const uniqueLGAs = [...new Set(lgaList)].sort();
      setAllLGAs(uniqueLGAs);
    } catch (error) {
      console.error("Error initializing Nigeria locations:", error);
    }
  }, []);

  // Update LGAs when state changes
  const updateSelectedState = (state) => {
    setSelectedState(state);
    
    if (state) {
      try {
        const lgasForState = NaijaStates.lgas(state);
        setStateLGAs(lgasForState);
      } catch (error) {
        console.error(`Error loading LGAs for ${state}:`, error);
        setStateLGAs([]);
      }
    } else {
      setStateLGAs([]);
    }
  };

  // Function to find which state an LGA belongs to
  const findStateByLGA = (lga) => {
    if (!lga) return null;
    
    for (const state of statesList) {
      try {
        const stateLGAs = NaijaStates.lgas(state);
        if (stateLGAs.includes(lga)) {
          return state;
        }
      } catch (error) {
        console.error(`Error checking LGAs for ${state}:`, error);
      }
    }
    
    return null;
  };

  // Get capital city of a state
  const getStateCapital = (state) => {
    if (!state) return null;
    
    try {
      return NaijaStates.capital(state);
    } catch (error) {
      console.error(`Error getting capital for ${state}:`, error);
      return null;
    }
  };

  return {
    // Data
    statesList,
    allLGAs,
    stateLGAs,
    selectedState,
    
    // Functions
    updateSelectedState,
    findStateByLGA,
    getStateCapital
  };
};

export default useNigeriaLocations;