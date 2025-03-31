import React, { useState, useEffect } from 'react';
import MarkdownRenderer from 'react-markdown';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [images, setImages] = useState({});

  useEffect(() => {
    const fetchRoomData = async () => {
      const roomData = [
        { id: 1, name: 'Room 1', description: 'This is room 1', keywords: 'room, hotel' },
        { id: 2, name: 'Room 2', description: 'This is room 2', keywords: 'room, hotel' },
        { id: 3, name: 'Room 3', description: 'This is room 3', keywords: 'room, hotel' },
      ];
      setRooms(roomData);
      const images = {};
      for (const room of roomData) {
        const imageUrl = await getImageUrl(room.keywords);
        images[room.id] = imageUrl;
      }
      setImages(images);
    };
    fetchRoomData();
  }, []);

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Room List</h1>
      {rooms.map((room) => (
        <div key={room.id} className="bg-white shadow-md p-4 mb-4">
          <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
          <MarkdownRenderer markdown={room.description} />
          {images[room.id] && (
            <img src={images[room.id]} alt="Room Image" className="w-full h-64 object-cover mt-4"/>
          )}
        </div>
      ))}
    </div>
  );
};

export default RoomList;