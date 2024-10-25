import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Horoscope.css'

const truncateContent = (content, maxLength) => {
  if (content.length <= maxLength) return content;
  return content.substr(content.length - maxLength).trim();
};

const HoroscopeSign = ({ id, name_ar, name_en, date, symbol, content }) => (
  <div className="horoscope-sign">
    <div className="sign-icon"><img src={symbol} alt={name_en} /></div>
    <h3>{name_ar}</h3>
    <p>{date}</p>
    <p>{truncateContent(content.split('\n')[0], 75)}</p>
    <Link className="list_butten" to={`/برج-${name_ar}-اليوم`}>اقرى المزيد</Link>

  </div>
);

const HoroscopeList = () => {
  const [horoscopes, setHoroscopes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHoroscopes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/horoscopes/`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setHoroscopes(data);
      } catch (error) {
        console.error('Error fetching horoscopes:', error);
        setError('Failed to fetch horoscopes. Please try again later.');
      }
    };
  
    fetchHoroscopes();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (horoscopes.length === 0) return <div>Loading horoscopes...</div>;

  return (
    <div className='horoscopelist-container'>
        <h1 className="rest_of_the_horoscopes">توقعات الأبراج لهذا اليوم </h1>
        <div className="horoscope-container">
          {horoscopes.map((horoscope) => (
            <HoroscopeSign
              key={horoscope.id}
              id={horoscope.id}
              name_ar={horoscope.name_ar}
              name_en={horoscope.name_en}
              date={horoscope.date}
              symbol={horoscope.icon_image}
              content={horoscope.content}
            />
          ))}
       </div>
    </div>

  );
};

export default HoroscopeList;