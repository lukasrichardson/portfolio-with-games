import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Layout, Menu } from  'antd';

const { Header } = Layout;
// const navOptions = [
//     {
//         name: 'Home',
//         path: '/',

//     }
// ]

class NavBar extends Component {
    constructor() {
        super();
        this.state = {

        };
    }

    render() {
        return (
            <Layout>
                <Header className="header" style={{ zIndex: 1, width: '100%' }}>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
                    <Link className='header-link' to='/'>
                        <Menu.Item key="1">nav 1</Menu.Item>
                    </Link>
                        <Menu.Item key="2">nav 2</Menu.Item>
                        <Menu.Item key="3">nav 3</Menu.Item>
                </Menu>
                </Header>
            </Layout>
        )
    }
}

export default NavBar;