'use client';

import { useEffect } from 'react';
import App from '@/adaptive-learning-platform';

export default function Home() {
  useEffect(() => {
    console.log('Home page mounted');
    console.log('Document ready:', typeof document !== 'undefined');
  }, []);

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, background: '#0a0a14', color: '#00d9ff', padding: '10px', fontSize: '12px', zIndex: 9999 }}>
        ✓ Page loaded
      </div>
      <App />
    </>
  );
}
