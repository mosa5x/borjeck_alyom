import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HoroscopeList from './components/HoroscopeList';
import HoroscopeDetail from './components/HoroscopeDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={<HoroscopeList />} />
            <Route path="/horoscope/:id" element={<HoroscopeDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;