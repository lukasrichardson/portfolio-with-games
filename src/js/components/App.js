import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';
import NavBar from './NavBar';
import Play from './Pages/Play';
import Play2 from './Pages/Play2';
import Home from './Pages/Home';

const routes = [
    {
        path: '/home',
        component: Home,
        name: 'Home'
    },
    {
        path: '/play',
        component: Play,
        name: 'Game 1'
    },
    {
        path: '/play2',
        component: Play2,
        name: 'Game 2'
    }
]

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Router>
                <NavBar routes={routes}/>
                <Switch>
                    {routes.map( (item, index) => (
                        <Route key={index} path={item.path} exact component={item.component} />
                    ))}
                    <Redirect from="/" to="/home" />
                </Switch>
            </Router>
        )
    }
}
export default App;