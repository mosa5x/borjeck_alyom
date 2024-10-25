import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import HoroscopeList from './HoroscopeList';
import '../css/HoroscopePage.css'
const HoroscopeDetail = () => {
    const { name } = useParams(); // Changed from id to name
    const [horoscope, setHoroscope] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchHoroscope = async () => {
          try {
              setLoading(true);
              const response = await fetch(`${process.env.REACT_APP_API_URL}/api/horoscopes/`, {
                  credentials: 'include',
              });
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const data = await response.json();
              
              // Remove the extra text from the name parameter
              const horoscopeName = name.replace('-اليوم', '').replace('برج-', '');
              // Find horoscope by name_ar
              const matchingHoroscope = data.find(h => h.name_ar === horoscopeName);
              if (matchingHoroscope) {
                  setHoroscope(matchingHoroscope);
              } else {
                  setError('لم يتم العثور على البرج');
              }
              setLoading(false);
          } catch (error) {
              console.error('Error fetching horoscope:', error);
              setError('فشل في جلب معلومات البرج. الرجاء المحاولة مرة أخرى لاحقاً.');
              setLoading(false);
          }
      };
  
      fetchHoroscope();
  }, [name]);

    if (loading) return <div className="loading">جاري التحميل...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!horoscope) return <div className="no-data">لم يتم العثور على معلومات البرج</div>;


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
          <Link className='Characteristics_butten' to={`/صفات-برج-${horoscope.name_ar}`}>
              اعرف صفات برج {horoscope.name_ar}
          </Link>
        </div>
        <h1 className="rest_of_the_horoscopes">توقعات بقية الأبراج لهذا اليوم </h1>
        <HoroscopeList />
      </div>
    </>
  );
};

export default HoroscopeDetail;