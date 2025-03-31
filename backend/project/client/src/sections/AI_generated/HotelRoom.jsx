import React, { useState, useEffect } from 'react';
import MarkdownRenderer from 'react-markdown';

const HotelRoom = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [markdownText, setMarkdownText] = useState('');

  const getImageUrl = async (keyword) => {
    const clientId = "J3Af0qhs3oT2DAqbTjP9IAwgM575BYNOrJlAcC-BtZs";
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&client_id=${clientId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.results.length > 0 ? data.results[0].urls.regular : null;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      const url = await getImageUrl('hotel room');
      setImageUrl(url);
    };
    fetchImage();
  }, []);

  useEffect(() => {
    setMarkdownText('# Room Details
## Room Type
* Deluxe
* Premium
## Price
* $100/night
## Amenities
* Free Wi-Fi
* Breakfast included');
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-10 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold mb-4">Hotel Room</h1>
      {imageUrl && <img src={imageUrl} alt="Hotel Room" className="w-full h-64 object-cover mb-4" />}
      <MarkdownRenderer markdown={markdownText} />
    </div>
  );
};

export default HotelRoom;