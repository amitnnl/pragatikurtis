import React, { useState, useEffect } from 'react';
import authFetch from '../utils/authFetch';

const LocationMap = () => {
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapUrl = async () => {
      setLoading(true);
      try {
        const response = await authFetch('/get_setting.php?name=map_embed_url');
        const data = await response.json();
        if (data.setting_value) {
          setMapEmbedUrl(data.setting_value);
        }
      } catch (err) {
        console.error("Failed to fetch map URL:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapUrl();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 md:h-full bg-surface-200 rounded-2xl flex items-center justify-center">
        <p className="text-text-500">Loading map...</p>
      </div>
    );
  }

  if (!mapEmbedUrl) {
    return (
      <div className="w-full h-96 md:h-full bg-surface-200 rounded-2xl flex items-center justify-center">
        <p className="text-text-500 text-center p-4">Map location has not been set in the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 md:h-full bg-surface-200 rounded-2xl overflow-hidden shadow-lg border border-surface-300">
      <iframe
        src={mapEmbedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Our Location"
      ></iframe>
    </div>
  );
};

export default LocationMap;
