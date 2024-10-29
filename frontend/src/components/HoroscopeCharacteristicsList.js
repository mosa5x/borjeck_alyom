import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../css/HoroscopeCharacteristicsList.css';

const HoroscopeCharacteristicsList = () => {
    const [horoscopes, setHoroscopes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHoroscopes = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/horoscopes/`, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setHoroscopes(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching horoscopes:', error);
                setError('Failed to fetch horoscopes. Please try again later.');
                setLoading(false);
            }
        };

        fetchHoroscopes();
    }, []);

    if (loading) return <div className="loading"></div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <>
            <Helmet>
                <title>صفات الأبراج - خصائص ومميزات كل برج</title>
                <meta name="description" content="اكتشف صفات وخصائص جميع الأبراج وتعرف على مميزات كل برج" />
                <meta name="keywords" content="صفات الأبراج, خصائص الأبراج, مميزات الأبراج, شخصية الأبراج" />
            </Helmet>

            <div className="horoscope-characteristics-list">
                <h1 className="page-title">صفات الأبراج</h1>
                <div className="horoscopes-grid">
                    {horoscopes.map(horoscope => (
                        <Link key={horoscope.id} to={`/صفات-برج-${horoscope.name_ar}`} className="horoscope-card">
                               

                            <div className="horoscope-content">
                                <img 
                                    src={horoscope.icon_image} 
                                    alt={`برج ${horoscope.name_ar}`}
                                    className="horoscope-icon"
                                />
                                <h2>{horoscope.name_ar}</h2>
                                <p className="date-range">{horoscope.date_range}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default HoroscopeCharacteristicsList;