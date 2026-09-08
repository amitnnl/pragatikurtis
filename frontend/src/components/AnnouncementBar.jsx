import React from 'react';

const AnnouncementBar = () => {
  return (
    <div className="bg-soft-mint text-primary text-xs font-semibold uppercase tracking-wider py-2 px-4 text-center z-50 relative">
      <div className="container mx-auto flex items-center justify-center gap-2 md:gap-4 flex-wrap">
        <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>
        <span className="hidden md:inline">•</span>
        <span>COD AVAILABLE</span>
        <span className="hidden md:inline">•</span>
        <span>EASY RETURNS</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
