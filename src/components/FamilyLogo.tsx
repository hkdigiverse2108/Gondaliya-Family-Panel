import React from 'react';
import logoImg from '../assets/logo.jpeg';

interface FamilyLogoProps {
  size?: number | string;
  showText?: boolean;
  variant?: 'full' | 'badge' | 'tree-only';
}

export const FamilyLogo: React.FC<FamilyLogoProps> = ({ 
  size = '100%', 
}) => {
  const widthHeight = typeof size === 'number' ? `${size}px` : size;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <img 
        src={logoImg} 
        alt="Gondaliya Family Logo" 
        style={{
          width: widthHeight,
          height: widthHeight,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1.5px solid #ffffff',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
          display: 'block'
        }}
      />
    </div>
  );
};

export default FamilyLogo;
