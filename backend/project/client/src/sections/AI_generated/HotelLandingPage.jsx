import React, { useState, useEffect } from 'react';
import MarkdownRenderer from 'react-markdown';

const HotelLandingPage = () => {
  const [imageUrls, setImageUrls] = useState({});
  const [markdownText, setMarkdownText] = useState(`# Hotel Booking and Management
This is a sample hotel booking and management landing page.`);

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
    const fetchImages = async () => {
      const imageUrls = {};
      imageUrls.hero = await getImageUrl('hotel lobby');
      imageUrls.room = await getImageUrl('hotel room');
      setImageUrls(imageUrls);
    };
    fetchImages();
  }, []);

  return (
    <div className="h-screen w-full flex flex-col">
      <header className="h-1/5 flex items-center justify-center">
        <h1 className="text-3xl font-bold">Hotel Booking and Management</h1>
      </header>
      <main className="h-4/5 flex flex-col items-center justify-center">
        <section className="w-1/2 h-1/2 flex flex-col items-center justify-center">
          <MarkdownRenderer markdown={markdownText} />
          {imageUrls.hero && (
            <img src={imageUrls.hero} alt="Hotel Lobby" className="w-full h-full object-cover" />
          )}
        </section>
        <section className="w-1/2 h-1/2 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">Rooms</h2>
          {imageUrls.room && (
            <img src={imageUrls.room} alt="Hotel Room" className="w-full h-full object-cover" />
          )}
        </section>
      </main>
    </div>
  );
};

export default HotelLandingPage;