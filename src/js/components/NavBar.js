import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Layout, Menu } from  'antd';

const { Header } = Layout;

class NavBar extends Component {
    constructor() {
        super();
        this.state = {

        };
    }

    getDefaultSelectedKey = () => {
        const { routes } = this.props;
        const { pathname } = window.location;
        const navOption = routes.find(item => item.path === pathname);
        const index = routes.indexOf(navOption);
        return index >= 0 ? [`${index}`] : ['0'];
    }

    render() {
        const { routes } = this.props;
        const defaultSelectedKeys = this.getDefaultSelectedKey();
        return (
            <Layout>
                <Header className="header" style={{ zIndex: 1, width: '100%' }}>
                    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={defaultSelectedKeys}>
                            {routes.map( (item, index) => (
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