import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Layout, Menu } from  'antd';

const { Header } = Layout;
const navOptions = [
    {
        name: 'Home',
        path: '/',
    },
    {
        name: 'Play',
        path: '/play'

    }
]

class NavBar extends Component {
    constructor() {
        super();
        this.state = {

        };
    }

    getDefaultSelectedKey = () => {
        console.log('key:', window.location);
        const { pathname } = window.location;
        const navOption = navOptions.find(item => item.path === pathname);
        const index = navOptions.indexOf(navOption);
        return index >= 0 ? [`${index}`] : ['0'];
    }

    render() {
        const defaultSelectedKeys = this.getDefaultSelectedKey();
        return (
            <Layout>
                <Header className="header" style={{ zIndex: 1, width: '100%' }}>
                    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={defaultSelectedKeys}>
                            {navOptions.map( (item, index) => (
                                <Menu.Item key={index}>
                                    <Link className='header-link' to={item.path}>
                                        {item.name}
                                    </Link>
                                </Menu.Item>
                            ))}
                    </Menu>
                </Header>
            </Layout>
        )
    }
}

export default NavBar;