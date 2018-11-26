import React, { PureComponent } from 'react';

class LoginForm extends PureComponent {
    static displayName = 'LoginForm';

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
        };
    }

    render() {
        let { username, password } = this.state;
        let disabled = !username.trim() || !password.trim();
        return (
            <div className="login-form">
                {this.renderError()}
                <form onSubmit={this.handleFormSubmit}>
                    <div className="label">Username or E-mail:</div>
                    <div className="field">
                        <input type="text" value={username} onChange={this.handleUsernameChange} />
                    </div>
                    <div className="label">Password:</div>
                    <div className="field">
                        <input type="password" value={password} onChange={this.handlePasswordChange} />
                    </div>
                    <div className="buttons">
                        <button type="submit" disabled={disabled}>
                            Log in
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    renderError() {
        let { error } = this.state;
        if (!error) {
            return null;
        }
        return <div className="error">Error: {error.message}</div>
    }

    handleUsernameChange = (evt) => {
        this.setState({ username: evt.target.value });
    }

    handlePasswordChange = (evt) => {
        this.setState({ password: evt.target.value });
    }

    handleFormSubmit = async (evt) => {
        evt.preventDefault();
        try {
            let { django } = this.props;
            let { username, password } = this.state;
            let credentials = { username, password };
            if (username.indexOf('@') !== -1) {
                credentials = { email: username, password };
            }
            await django.logIn(credentials);
        } catch (err) {
            this.setState({ error: err });
        }
    }
}

export {
    LoginForm as default,
    LoginForm,
};
