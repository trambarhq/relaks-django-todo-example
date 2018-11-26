import React, { PureComponent } from 'react';
import Django from 'django';
import LoginForm from 'login-form';
import LogoutButton from 'logout-button';
import TodoList from 'todo-list';
import ErrorBoundary from 'error-boundary';

import 'style.scss';

class Application extends PureComponent {
    static displayName = 'Application';

    constructor(props) {
        super(props);
        let { dataSource } = this.props;
        this.state = {
            django: new Django(dataSource),
            authenticating: false,
            reusedToken: false,
        };
    }

    render() {
        let { django, authenticating } = this.state;
        if (authenticating) {
            return (
                <div>
                    <ErrorBoundary>
                        <h1>Log in</h1>
                        <LoginForm django={django} />
                    </ErrorBoundary>
                </div>
            );
        } else {
            return (
                <div>
                    <ErrorBoundary>
                        <LogoutButton django={django} />
                        <h1>To-Do list</h1>
                        <TodoList django={django} />
                    </ErrorBoundary>
                </div>
            );
        }
    }

    componentDidMount() {
        let { dataSource } = this.props;
        dataSource.addEventListener('change', this.handleDataSourceChange);
        dataSource.addEventListener('authentication', this.handleDataSourceAuthentication);
        dataSource.addEventListener('authorization', this.handleDataSourceAuthorization);
        dataSource.addEventListener('deauthorization', this.handleDataSourceDeauthorization);
    }

    handleDataSourceChange = (evt) => {
        this.setState({ django: new Django(evt.target) });
    }

    handleDataSourceAuthentication = (evt) => {
        let { django, reusedToken } = this.state;
        let token = sessionStorage.token;
        if (token && !reusedToken) {
            django.authorize(token);
            this.setState({ reusedToken: true });
        } else {
            delete sessionStorage.token;
            this.setState({ authenticating: true });
        }
    }

    handleDataSourceAuthorization = (evt) => {
        if (evt.fresh) {
            sessionStorage.token = evt.token;
            this.setState({ authenticating: false });
        }
    }

    handleDataSourceDeauthorization = (evt) => {
        delete sessionStorage.token;
    }
}

export {
    Application as default,
    Application
};
