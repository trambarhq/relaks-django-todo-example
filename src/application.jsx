import React, { PureComponent } from 'react';
import Django from 'django';
import TodoList from 'todo-list';
import LoginDialog from 'login-dialog';
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
            authenticationError: null,
        };
    }

    /**
     * Render the application
     *
     * @return {VNode}
     */
    render() {
        let { django, authenticating, authenticationError } = this.state;
        let listProps = { django };
        let dialogProps = {
            show: authenticating,
            error: authenticationError,
            onAttempt: this.handleLoginAttempt,
            onCancel: this.handleLoginCancel,
        };
        return (
            <div>
                <button className="logout" onClick={this.handleLogOutClick}>
                    Log out
                </button>
                <h1>To-Do list</h1>
                <ErrorBoundary>
                    <TodoList {...listProps} />
                    <LoginDialog {...dialogProps} />
                </ErrorBoundary>
            </div>
        );
    }

    /**
     * Added change handlers when component mounts
     */
    componentDidMount() {
        let { dataSource } = this.props;
        dataSource.addEventListener('change', this.handleDataSourceChange);
        dataSource.addEventListener('authentication', this.handleDataSourceAuthentication);
        dataSource.addEventListener('authorization', this.handleDataSourceAuthorization);
        dataSource.addEventListener('deauthorization', this.handleDataSourceDeauthorization);
    }

    /**
     * Called when the data source changes
     *
     * @param  {RelaksDjangoDataSourceEvent} evt
     */
    handleDataSourceChange = (evt) => {
        this.setState({ django: new Django(evt.target) });
    }

    /**
     * Called when the data source needs to authenticate the user
     *
     * @param  {RelaksDjangoDataSourceEvent} evt
     */
    handleDataSourceAuthentication = (evt) => {
        let { django } = this.state;
        let token = sessionStorage.token;
        if (token) {
            django.authorize(token);
        } else {
            this.setState({ authenticating: true });
        }
    }

    /**
     * Called when the data source has obtained authorization
     *
     * @param  {RelaksDjangoDataSourceEvent} evt
     */
    handleDataSourceAuthorization = (evt) => {
        let token = evt.token;
        sessionStorage.token = token;
    }

    /**
     * Called when the data source has lost authorization
     *
     * @param  {RelaksDjangoDataSourceEvent} evt
     */
    handleDataSourceDeauthorization = (evt) => {
        delete sessionStorage.token;
    }

    /**
     * Called when the user submits a username and password
     *
     * @param  {Object}  evt
     */
    handleLoginAttempt = async (evt) => {
        let { django } = this.state;
        let credentials = evt.credentials;
        try {
            await django.authenticate(credentials);
            this.setState({ authenticating: false });
        } catch (err) {
            this.setState({ authenticationError: err.message });
        }
    }

    handleLoginCancel = (evt) => {
        let { django } = this.state;
        this.setState({ authenticating: false });
        django.cancelAuthentication();
    }

    handleLogOutClick = (evt) => {
        let { django } = this.state;
        django.revokeAuthorization();
    }
}

export {
    Application as default,
    Application
};
