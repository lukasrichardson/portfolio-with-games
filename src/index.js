import React from 'react';
import ReactDOM from 'react-dom';
// import game from './js/components/game';
import App from './js/components/App';
import 'antd/dist/antd.css';

const wrapper = document.getElementById('app');
wrapper ? ReactDOM.render(<App/>, wrapper) : null;