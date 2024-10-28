import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import HoroscopeList from './HoroscopeList';
import '../css/HoroscopePage.css'
import { Helmet } from 'react-helmet';  // Import Helmet

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


      <Helmet>
            {/* Basic Meta Tags */}
            <title>{horoscope.name_ar} | برجك اليوم</title>
            <meta name="description" content={`توقعات برج ${horoscope.name_ar} اليوم ${horoscope.date}. ${horoscope.content.slice(0, 150)}...`} />
            <meta name="keywords" content={`برج ${horoscope.name_ar}, توقعات برج ${horoscope.name_ar}, حظك اليوم ${horoscope.name_ar}, الابراج اليومية, ${horoscope.name_ar} اليوم`} />
            <link rel="canonical" href={`${window.location.origin}/برج-${horoscope.name_ar}-اليوم`} />
            
            {/* Open Graph Tags */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={`${horoscope.name_ar} | برجك اليوم`} />
            <meta property="og:description" content={`توقعات برج ${horoscope.name_ar} اليوم ${horoscope.date}`} />
            <meta property="og:image" content={horoscope.icon_image} />
            <meta property="og:url" content={`${window.location.origin}/برج-${horoscope.name_ar}-اليوم`} />
            <meta property="og:site_name" content="برجك اليوم" />
            
            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${horoscope.name_ar} | برجك اليوم`} />
            <meta name="twitter:description" content={`توقعات برج ${horoscope.name_ar} اليوم ${horoscope.date}`} />
            <meta name="twitter:image" content={horoscope.icon_image} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": `توقعات برج ${horoscope.name_ar} اليوم`,
                    "image": horoscope.icon_image,
                    "description": horoscope.content,
                    "datePublished": horoscope.date,
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `${window.location.origin}/برج-${horoscope.name_ar}-اليوم`
                    },
                    "author": {
                        "@type": "Organization",
                        "name": "برجك اليوم"
                    }
                })}
            </script>
      </Helmet>
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
        <HoroscopeList />
      </div>
    </>
  );
};

export default HoroscopeDetail;