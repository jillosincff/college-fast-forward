import { useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

export default function AlumniHome() {
  useEffect(() => { navigate('FreeTierDashboard'); }, []);
  return null;
}