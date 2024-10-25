import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import HoroscopeList from './components/HoroscopeList';
import HoroscopeDetail from './components/HoroscopeDetail';
import HoroscopeCalculator from './components/HoroscopeCalculator';
import Characteristics_of_thehorscope from './components/Characteristics_of_thehorscope';
import HoroscopeCharacteristicsList from './components/HoroscopeCharacteristicsList';
import RouteHandler from './components/RouteHandler';
function App() {
  const [isHomeVisible, setHomeVisible] = useState(true);

  const toggleHomeVisibility = (isVisible) => {
    setHomeVisible(!isVisible);
  };

  return (
    <HelmetProvider>
      <Router>
        <div className="App">
          <Header toggleHomeVisibility={toggleHomeVisibility} />
          <Helmet>
            {/* Default meta tags for your site */}
            <meta charSet="utf-8" />
            <title>موقع الأبراج - توقعات وخصائص الأبراج اليومية</title>
            <meta name="description" content="موقع الأبراج - اكتشف توقعات برجك اليومية وخصائص الأبراج" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="canonical" href={window.location.origin} />

            {/* Default Open Graph Tags */}
            <meta property="og:site_name" content="موقع الأبراج" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="موقع الأبراج - توقعات وخصائص الأبراج اليومية" />
            <meta property="og:description" content="اكتشف توقعات برجك اليومية وخصائص الأبراج" />
            <meta property="og:url" content={window.location.origin} />

            {/* Default Twitter Card Tags */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content="موقع الأبراج - توقعات وخصائص الأبراج اليومية" />
            <meta name="twitter:description" content="اكتشف توقعات برجك اليومية وخصائص الأبراج" />

            {/* Basic Schema.org Markup */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "موقع الأبراج",
                "description": "موقع الأبراج - توقعات وخصائص الأبراج اليومية",
                "url": window.location.origin,
              })}
            </script>
          </Helmet>

          <main className={`${isHomeVisible ? '' : 'hidden'}`}>
            <Routes>
              <Route path="/" element={<HoroscopeList />} />
              <Route path="/توقعات-الأبراج-اليومية" element={<HoroscopeList />} />
              <Route path="/اعرف-برجك-من-خلال-تاريخ-ميلادك" element={<HoroscopeCalculator />} />
              <Route path="/صفات-الابراج" element={<HoroscopeCharacteristicsList />} />
              <Route path="/:name" element={<RouteHandler />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;

// You can also export routes if needed
export const routes = [
  { path: "/" },
  { path: "/HoroscopeCalculator" },
  { path: "/horoscope/:id" },
  { path: "/Characteristics_of_thehorscope/:id" }
];