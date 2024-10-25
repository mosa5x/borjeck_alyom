// components/RouteHandler.js
import React from 'react';
import { useParams } from 'react-router-dom';
import HoroscopeDetail from './HoroscopeDetail';
import Characteristics_of_thehorscope from './Characteristics_of_thehorscope';

const RouteHandler = () => {
    const { name } = useParams();

    if (name.startsWith('برج-') && name.endsWith('-اليوم')) {
        return <HoroscopeDetail />;
    }
    
    if (name.startsWith('صفات-برج-')) {
        return <Characteristics_of_thehorscope />;
    }

    return <div>Page not found</div>;
};

export default RouteHandler;