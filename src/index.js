import React from 'react';
import ReactDOM from 'react-dom';
import App from './js/components/App';
import 'antd/dist/antd.compact.css';
import './scss/index.scss';

const wrapper = document.getElementById('app');
wrapper ? ReactDOM.render(<App/>, wrapper) : null;