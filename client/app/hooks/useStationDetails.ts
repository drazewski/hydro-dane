import { useQuery } from 'react-query';
import { getStationDetails } from '../services/stationDetailsService';

export const useStationDetails = () =>
  useQuery(['stationDetails'], getStationDetails, {
    staleTime: Infinity,
    retry: 1,
  });
