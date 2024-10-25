import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../css/Characteristics_of_thehorscope.css'
const Characteristics_of_thehorscope = () => {
    const { name } = useParams(); // Changed from id to name
    const [horoscopes, setHoroscopes] = useState([]);
    const [selectedHoroscope, setSelectedHoroscope] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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
                
                // Remove the prefix from the name
                const horoscopeName = name.replace('برج-', '');
                // Find horoscope by name_ar
                const matchingHoroscope = data.find(horoscope => horoscope.name_ar === horoscopeName);
                if (matchingHoroscope) {
                    setSelectedHoroscope(matchingHoroscope);
                } else {
                    setError('لم يتم العثور على البرج');
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching horoscopes:', error);
                setError('فشل في جلب معلومات البرج. الرجاء المحاولة مرة أخرى لاحقاً.');
                setLoading(false);
            }
        };
    
        fetchHoroscopes();
    }, [name]);

    const formatCharacteristics = (text) => {
        if (!text) return [];
        const points = text.split(/(\p{Emoji})/u).filter(Boolean);
        const formattedPoints = [];
        for (let i = 0; i < points.length; i += 2) {
            if (i + 1 < points.length) {
                formattedPoints.push(points[i] + points[i + 1]);
            } else {
                formattedPoints.push(points[i]);
            }
        }
        return formattedPoints;
    };

    // Create meta description from characteristics
    const createMetaDescription = (characteristics) => {
        if (!characteristics) return '';
        const points = formatCharacteristics(characteristics);
        return points.slice(0, 3).join(' '); // First 3 points for description
    };

    if (loading) return <div className="loading">جاري التحميل...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!selectedHoroscope) return <div className="no-data">لم يتم العثور على معلومات البرج</div>;

    return (
        <>
            <Helmet>
                {/* Basic Meta Tags */}
                <title>صفات برج {selectedHoroscope.name_ar} - خصائص ومميزات البرج المميزة</title>
                <meta name="description" content={`اكتشف صفات وخصائص برج ${selectedHoroscope.name_ar}: ${createMetaDescription(selectedHoroscope.characteristics_of_thehorscope)}`} />
                <meta name="keywords" content={`صفات برج ${selectedHoroscope.name_ar}, خصائص برج ${selectedHoroscope.name_ar}, مميزات برج ${selectedHoroscope.name_ar}, شخصية برج ${selectedHoroscope.name_ar}, برج ${selectedHoroscope.name_ar}, الابراج`} />
                <link rel="canonical" href={`${window.location.origin}/characteristics/${selectedHoroscope.name_ar}`} />
                
                {/* Open Graph Tags */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={`صفات برج ${selectedHoroscope.name_ar} - خصائص ومميزات البرج المميزة`} />
                <meta property="og:description" content={`اكتشف صفات وخصائص برج ${selectedHoroscope.name_ar}: ${createMetaDescription(selectedHoroscope.characteristics_of_thehorscope)}`} />
                <meta property="og:image" content={selectedHoroscope.icon_image} />
                <meta property="og:url" content={`${window.location.origin}/characteristics/${selectedHoroscope.name_ar}`} />
                <meta property="og:site_name" content="موقع الأبراج" />
                
                {/* Twitter Card Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`صفات برج ${selectedHoroscope.name_ar} - خصائص ومميزات البرج المميزة`} />
                <meta name="twitter:description" content={`اكتشف صفات وخصائص برج ${selectedHoroscope.name_ar}: ${createMetaDescription(selectedHoroscope.characteristics_of_thehorscope)}`} />
                <meta name="twitter:image" content={selectedHoroscope.icon_image} />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": `صفات برج ${selectedHoroscope.name_ar}`,
                        "image": selectedHoroscope.icon_image,
                        "description": createMetaDescription(selectedHoroscope.characteristics_of_thehorscope),
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": `${window.location.origin}/characteristics/${selectedHoroscope.name_ar}`
                        },
                        "author": {
                            "@type": "Organization",
                            "name": "موقع الأبراج"
                        }
                    })}
                </script>
            </Helmet>

            <div className="characteristics-page">
                <div className="main-container">
                    <div className="characteristics-content">
                        <div className="horoscope-header">
                            <img 
                                src={selectedHoroscope.icon_image} 
                                alt={`صفات برج ${selectedHoroscope.name_ar}`}
                                className="horoscope-icon"
                            />
                            <h1>صفات برج {selectedHoroscope.name_ar}</h1>
                        </div>
                        <div className="characteristics-list">
                            {formatCharacteristics(selectedHoroscope.characteristics_of_thehorscope).map((point, index) => (
                                <p key={index}>{point}</p>
                            ))}
                        </div>
                        <Link to={`/برج-${selectedHoroscope.name_ar}-اليوم`} className="daily-horoscope-link">
                                عرض توقعات برجك لهذا اليوم
                        </Link>
                    </div>
                    <div className="horoscopes-sidebar">
                        <h2>الأبراج</h2>
                        <div className="horoscope-buttons">
                        {horoscopes.map(horoscope => (
                            <Link
                                key={horoscope.id}
                                to={`/صفات-برج-${horoscope.name_ar}`}
                                className={`horoscope-button ${selectedHoroscope.name_ar === horoscope.name_ar ? 'active' : ''}`}
                            >
                                {horoscope.name_ar}
                            </Link>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Characteristics_of_thehorscope;