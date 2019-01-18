import React, { PureComponent } from 'react';
import Django from 'django';
import LoginForm from 'login-form';
import LogoutButton from 'logout-button';
import TodoList from 'todo-list';
import ErrorBoundary from 'error-boundary';

import 'style.scss';

class FrontEnd extends PureComponent {
    static displayName = 'FrontEnd';

    constructor(props) {
        super(props);
        let { dataSource } = this.props;
        this.state = {
            django: new Django(dataSource),
            authenticating: false,
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

    handleDataSourceAuthentication = async (evt) => {
        let { django } = this.state;
        let token = sessionStorage.token;
        let success = await django.authorize(token);
        if (!success) {
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
    FrontEnd as default,
    FrontEnd
};
