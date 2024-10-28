import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Horoscope.css'
import { Helmet } from 'react-helmet';

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
    <>
                <Helmet>
                    <title>توقعات الأبراج اليوم | أبراج اليوم والحظ اليومي</title>
                    <meta name="description" content="اقرأ توقعات الأبراج اليومية مجاناً مع تحديث يومي لجميع الأبراج: الحمل، الثور، الجوزاء، السرطان، الأسد، العذراء، الميزان، العقرب، القوس، الجدي، الدلو، الحوت. توقعات الحب والعمل والصحة والحياة الشخصية" />
                    <meta name="keywords" content="توقعات الأبراج اليوم, الأبراج اليومية, حظك اليوم, برج الحمل, برج الثور, برج الجوزاء, برج السرطان, برج الأسد, برج العذراء, برج الميزان, برج العقرب, برج القوس, برج الجدي, برج الدلو, برج الحوت" />
                    
                    {/* Open Graph Tags for better social sharing */}
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="توقعات الأبراج اليوم | أبراج اليوم والحظ اليومي" />
                    <meta property="og:description" content="اقرأ توقعات الأبراج اليومية مجاناً لجميع الأبراج مع تحديث يومي. توقعات الحب والعمل والصحة والحياة الشخصية" />
                    <meta property="og:url" content={window.location.origin} />
                    <meta property="og:site_name" content="برجك اليوم" />

                    {/* Twitter Card Tags */}
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:title" content="توقعات الأبراج اليوم | أبراج اليوم والحظ اليومي" />
                    <meta name="twitter:description" content="اقرأ توقعات الأبراج اليومية مجاناً لجميع الأبراج مع تحديث يومي. توقعات الحب والعمل والصحة والحياة الشخصية" />

                    {/* Structured Data */}
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebPage",
                            "name": "توقعات الأبراج اليوم",
                            "description": "اقرأ توقعات الأبراج اليومية مجاناً مع تحديث يومي لجميع الأبراج",
                            "url": window.location.origin,
                            "publisher": {
                                "@type": "Organization",
                                "name": "برجك اليوم"
                            }
                        })}
                    </script>
                </Helmet>
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
    </>


  );
};

export default HoroscopeList;