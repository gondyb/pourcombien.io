import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
    uri: 'http://82.65.25.159:5000/graphql'
});

ReactDOM.render(<App client={client} />, document.getElementById('root'));

serviceWorker.unregister();
