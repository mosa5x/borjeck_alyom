import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header.css';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = ({ toggleHomeVisibility }) => {
  const navRef = useRef();
  const navigate = useNavigate();

  const showNavbar = () => {
    navRef.current.classList.toggle('responsive_nav');
    toggleHomeVisibility(navRef.current.classList.contains('responsive_nav'));
  };

  const handleHomeClick = () => {
    navRef.current.classList.remove('responsive_nav');
    toggleHomeVisibility(false);
    navigate('/توقعات-الأبراج-اليومية');  // Removed extra quote
};

  const handleCalculatorClick = () => {
    navRef.current.classList.remove('responsive_nav');
    toggleHomeVisibility(false);
    navigate('/اعرف-برجك-من-خلال-تاريخ-ميلادك');
  };
  const handleCharacteristicsClick = () => {
    navRef.current.classList.remove('responsive_nav');
    toggleHomeVisibility(false);
    navigate('/صفات-الابراج');
  };

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <img src='/hooscope logo copy 2.ico' alt="Horoscope Logo" className="logo" />
        </Link>
      </div>
      <nav ref={navRef}>
        <ul>
          <li><button onClick={handleHomeClick}>الرئيسية</button></li>
          <li><button onClick={handleCharacteristicsClick}>صفات الأبراج</button></li>
          <li><button onClick={handleCalculatorClick}>حاسبة البرج</button></li>
          <button className="nav-btn nav-close-btn" onClick={showNavbar}>
            <FaTimes />
          </button>
        </ul>
      </nav>
      <button className="nav-btn" onClick={showNavbar}>
        <FaBars />
      </button>
    </header>
  );
};

export default Header;