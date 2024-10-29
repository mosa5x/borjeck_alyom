import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/HoroscopeCalculator.css';
import HoroscopeList from './HoroscopeList';

const HoroscopeCalculator = () => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [zodiacSign, setZodiacSign] = useState(null);
  const [error, setError] = useState('');
  const [horoscopes, setHoroscopes] = useState([]);

  const months = [
    '1 - كانون الثاني', '2 - شباط', '3 - آذار', '4 - نيسان', '5 - أيار', '6 - حزيران',
    '7 - تموز', '8 - آب', '9 - أيلول', '10 - تشرين الأول', '11 - تشرين الثاني', '12 - كانون الأول'
  ];

  const zodiacSigns = [
    { name: 'الحمل',  start: [3, 21], end: [4, 19] },
    { name: 'الثور', start: [4, 20], end: [5, 20] },
    { name: 'الجوزاء',  start: [5, 21], end: [6, 20] },
    { name: 'السرطان', start: [6, 21], end: [7, 22] },
    { name: 'الأسد',  start: [7, 23], end: [8, 22] },
    { name: 'العذراء',  start: [8, 23], end: [9, 22] },
    { name: 'الميزان',  start: [9, 23], end: [10, 23] },
    { name: 'العقرب',  start: [10, 24], end: [11, 21] },
    { name: 'القوس',  start: [11, 22], end: [12, 21] },
    { name: 'الجدي', start: [12, 22], end: [1, 19] },
    { name: 'الدلو', start: [1, 20], end: [2, 18] },
    { name: 'الحوت',  start: [2, 19], end: [3, 20] }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchHoroscopes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/horoscopes/`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setHoroscopes(data);
      } catch (error) {
        console.error('Error fetching horoscopes:', error);
      }
    };

    fetchHoroscopes();
  }, []);

  const calculateZodiacSign = () => {
    setError('');
    setZodiacSign(null);

    if (!day || !month || !year) {
      setError('الرجاء ملء جميع الحقول');
      return;
    }

    let gregorianDay = parseInt(day);
    let gregorianMonth = parseInt(month.split(' - ')[0]);
    let gregorianYear = parseInt(year);

    const date = new Date(gregorianYear, gregorianMonth - 1, gregorianDay);

    for (const sign of zodiacSigns) {
      let start = new Date(gregorianYear, sign.start[0] - 1, sign.start[1]);
      let end = new Date(gregorianYear, sign.end[0] - 1, sign.end[1]);

      if (sign.end[0] < sign.start[0]) {
        if (gregorianMonth < sign.start[0]) {
          start = new Date(gregorianYear - 1, sign.start[0] - 1, sign.start[1]);
        } else {
          end = new Date(gregorianYear + 1, sign.end[0] - 1, sign.end[1]);
        }
      }

      if (date >= start && date <= end) {
        const horoscope = horoscopes.find(h => h.name_ar === sign.name);
        setZodiacSign(horoscope);
        return;
      }
    }

    setError('برج غير معروف');
  };

  const formatCharacteristics = (text) => {
    if (!text) return [];
    // Split the text by emoji characters
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

  return (
    <>

      <div className="horoscope-calculator">
            <h2>اعرف برجك من خلال تاريخ ميلادك </h2>
            <div className="date-inputs">
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                <option value="">اليوم</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="">الشهر</option>
                {months.map((m, i) => (
                  <option key={i} value={m}>{m}</option>
                ))}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">السنة</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button className='HoroscopeCalculator_button' onClick={calculateZodiacSign}>عرض البرج</button>
            {error && <div className="error">{error}</div>}
            {zodiacSign && (
              <div className="result">
                <h3>برجك هو: {zodiacSign.name_ar}</h3>
                <img src={zodiacSign.icon_image} alt={zodiacSign.name_ar} className="horoscope-icon" />
                <h4>:صفات برج {zodiacSign.name_ar}</h4>
                <div className="characteristics">
                  {formatCharacteristics(zodiacSign.characteristics_of_thehorscope).map((point, index) => (
                    <p key={index}>{point}</p>
                  ))}
                </div>
                <Link to={`/برج-${zodiacSign.name_ar}-اليوم`}>عرض توقعات برجك لهذا اليوم</Link>

              </div>
            )}
      </div>
      <HoroscopeList />


    </>

  );
};

export default HoroscopeCalculator;