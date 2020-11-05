import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';
import NavBar from './NavBar';
import Play from './Pages/Play';
import Home from './Pages/Home';

const routes = [
    {
        path: '/home',
        component: Home
    },
    {
        path: '/play',
        component: Play
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
                <NavBar />
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