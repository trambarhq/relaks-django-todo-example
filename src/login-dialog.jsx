import React, { PureComponent } from 'react';

class LoginDialog extends PureComponent {
    static displayName = 'LoginDialog';

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
        };
    }

    render() {
        let { show } = this.props;
        let { username, password } = this.state;
        if (!show) {
            return null;
        }
        let disabled = !username.trim() || !password.trim();
        return (
            <div className="login-dialog">
                <div className="title">Login</div>
                {this.renderError()}
                <form onSubmit={this.handleFormSubmit}>
                    <div className="label">Username or E-mail:</div>
                    <div className="field">
                        <input type="text" value={username} onChange={this.handleUsernameInput} />
                    </div>
                    <div className="label">Password:</div>
                    <div className="field">
                        <input type="password" value={password} onChange={this.handlePasswordInput} />
                    </div>
                    <div className="buttons">
                        <button type="button" onClick={this.handleCancelClick}>
                            Cancel
                        </button>
                        <button type="submit" disabled={disabled}>
                            Log in
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    renderError() {
        let { error } = this.props;
        if (!error) {
            return null;
        }
        return <div className="error">Error: {error}</div>
    }

    handleUsernameInput = (evt) => {
        this.setState({ username: evt.target.value });
    }

    handlePasswordInput = (evt) => {
        this.setState({ password: evt.target.value });
    }

    handleCancelClick = (evt) => {
        if (this.props.onCancel) {
            this.props.onCancel({
                type: 'attempt',
                target: this,
            });
        }
    }

    handleFormSubmit = (evt) => {
        evt.preventDefault();
        let { username, password } = this.state;
        let credentials = { username, password };
        if (username.indexOf('@') !== -1) {
            credentials = { email: username, password };
        }
        if (this.props.onAttempt) {
            this.props.onAttempt({
                type: 'attempt',
                target: this,
                credentials,
            });
        }
    }
}

export {
    LoginDialog as default,
    LoginDialog,
};
