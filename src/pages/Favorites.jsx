import React, { useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

export default function Favorites() {
  useEffect(() => {
    navigate('Dashboard');
  }, []);
  return null;
}