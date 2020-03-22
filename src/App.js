import React, { useEffect } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';


import { ApolloProvider } from '@apollo/react-hooks';
import AdminPage from './components/AdminPage';
import NewGamePage from './components/NewGamePage';
import PlayPage from './components/PlayPage';

function App(props) {
  useEffect(() => {
    document.title = "pourcombien.io"
  }, []);

  return (    
    <ApolloProvider client={props.client}>
    <div>
      <h2>Pour combien ? <span role="img" aria-label="Emoji pensif">🤔</span></h2>
    </div>

    <Router>
      <Switch>
        <Route exact path="/admin" component={AdminPage} />
        <Route exact path="/play/:id/:player" component={PlayPage} />
        <Route exact path="/play/:id" component={PlayPage} />
        <Route exact path="/" component={NewGamePage} />
      </Switch>
    </Router>
  </ApolloProvider>
  );
}

export default App;
