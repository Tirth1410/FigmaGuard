import React, { useState, useEffect } from 'react';
import MarkdownRenderer from 'react-markdown';

async function getImageUrl(keyword) {
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
}

const HotelBooking = () => {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomType, setRoomType] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [markdownText, setMarkdownText] = useState('# Hotel Booking\n\nPlease select your check-in and check-out dates, and choose your preferred room type.');
  
  useEffect(() => {
    const fetchImage = async () => {
      const image_url = await getImageUrl('hotel room');
      setImageUrl(image_url);
    };
    fetchImage();
  }, []);
  
  const handleBooking = () => {
    alert(`You have booked a ${roomType} room from ${checkInDate} to ${checkOutDate}.`);
  };
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Book a Room</h2>
        <div className="flex flex-col mb-4">
          <label className="text-lg font-bold mb-2">Check-in Date:</label>
          <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="p-2 border border-gray-400 rounded-lg" />
        </div>
        <div className="flex flex-col mb-4">
          <label className="text-lg font-bold mb-2">Check-out Date:</label>
          <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className="p-2 border border-gray-400 rounded-lg" />
        </div>
        <div className="flex flex-col mb-4">
          <label className="text-lg font-bold mb-2">Room Type:</label>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="p-2 border border-gray-400 rounded-lg">
            <option value="">Select Room Type</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
          </select>
        </div>
        <button onClick={handleBooking} className="bg-blue-500 text-white py-2 px-4 rounded-lg">Book Now</button>
        {imageUrl && (
          <img src={imageUrl} alt="Hotel Room" className="w-full h-64 object-cover mt-4" />
        )}
        <MarkdownRenderer markdown={markdownText} className="mt-4" />
      </div>
    </div>
  );
};

export default HotelBooking;