import { h, Component } from 'preact';
import Django from 'django';
import TodoList from 'todo-list';
import LoginDialog from 'login-dialog';

import 'style.scss';

/** @jsx h */

class Application extends Component {
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
                <h1>To-Do list</h1>
                <TodoList {...listProps} />
                <LoginDialog {...dialogProps} />
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
    }

    /**
     * Remove change handlers when component mounts
     */
    componentWillUnmount() {
        let { dataSource } = this.props;
        dataSource.removeEventListener('change', this.handleDataSourceChange);
        dataSource.removeEventListener('authentication', this.handleDataSourceAuthentication);
        dataSource.removeEventListener('authorization', this.handleDataSourceAuthorization);
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
            django.authorize('/rest-auth/login/', token);
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
     * Called when the user submits
     *
     * @param  {[type]}  evt
     *
     * @return {Promise}
     */
    handleLoginAttempt = async (evt) => {
        let { django } = this.state;
        let credentials = evt.credentials;
        try {
            await django.authenticate('/rest-auth/login/', credentials);
            this.setState({ authenticating: false });
        } catch (err) {
            console.error(err);
            this.setState({ authenticationError: err.message });
        }
    }

    handleLoginCancel = (evt) => {
        let { django } = this.state;
        this.setState({ authenticating: false });
        django.cancelAuthentication();
    }
}

export {
    Application as default,
    Application
};
