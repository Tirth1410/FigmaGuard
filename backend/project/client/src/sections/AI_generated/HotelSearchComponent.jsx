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

const HotelSearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hotelRooms, setHotelRooms] = useState([
    { id: 1, name: 'Room 1', amenities: ['Wi-Fi', 'AC', 'Parking'], description: 'This is a luxurious room with all amenities.' },
    { id: 2, name: 'Room 2', amenities: ['Wi-Fi', 'Parking'], description: 'This is a budget-friendly room with basic amenities.' },
    { id: 3, name: 'Room 3', amenities: ['Wi-Fi', 'AC'], description: 'This is a room with Wi-Fi and AC.' },
  ]);
  const [filteredHotelRooms, setFilteredHotelRooms] = useState(hotelRooms);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    const fetchImages = async () => {
      const urls = {};
      for (const room of hotelRooms) {
        for (const amenity of room.amenities) {
          const url = await getImageUrl(amenity);
          if (url) {
            urls[room.id] = { ...urls[room.id], [amenity]: url };
          }
        }
      }
      setImageUrls(urls);
    };
    fetchImages();
  }, [hotelRooms]);

  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
    const filteredRooms = hotelRooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()) || room.amenities.some((amenity) => amenity.toLowerCase().includes(searchTerm.toLowerCase())));
    setFilteredHotelRooms(filteredRooms);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 mt-10">
      <h1 className="text-3xl font-bold mb-4">Search Hotel Rooms</h1>
      <input className="w-full p-2 pl-10 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="search" value={searchTerm} onChange={handleSearch} placeholder="Search by room name or amenities..." />
      <div className="mt-6">
        {filteredHotelRooms.map((room) => (
          <div key={room.id} className="mb-6">
            <h2 className="text-xl font-bold mb-2">{room.name}</h2>
            <div className="flex flex-wrap -mx-2 mb-4">
              {room.amenities.map((amenity) => (
                <div key={amenity} className="w-full md:w-1/2 xl:w-1/3 p-2">
                  <div className="bg-white rounded-md p-4 shadow-md">
                    <h3 className="text-lg font-bold mb-2">{amenity}</h3>
                    {imageUrls[room.id] && imageUrls[room.id][amenity] && (
                      <img src={imageUrls[room.id][amenity]} alt={amenity} className="w-full h-32 object-cover mb-4" />
                    )}
                    <MarkdownRenderer markdown={`This room has **${amenity}**.`} />
                  </div>
                </div>
              ))}
            </div>
            <MarkdownRenderer markdown={room.description} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelSearchComponent;