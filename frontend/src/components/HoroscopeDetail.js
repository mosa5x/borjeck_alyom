import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../css/HoroscopePage.css';

const HoroscopeDetail = () => {
  const [horoscope, setHoroscope] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchHoroscope = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/horoscopes/${id}/`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setHoroscope(data);
      } catch (error) {
        console.error('Error fetching horoscope:', error);
      }
    };

    fetchHoroscope();
  }, [id]);

  if (!horoscope) return <div>Loading...</div>;

  return (
    <>
      <div className="container">
        <div className="content">
          <h1 className="horoscopename">{horoscope.name_ar} {horoscope.symbol}</h1>
          <span className="date">{horoscope.date}</span>
          <div className="line"></div>
          <div className="paragraph">
            {horoscope.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HoroscopeDetail;