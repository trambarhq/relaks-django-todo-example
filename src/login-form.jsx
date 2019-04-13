import React, { useState, useCallback } from 'react';

function LoginForm(props) {
    const { django } = props;
    const [ usename, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState();
    const disabled = !username.trim() || !password.trim();

    const handleUsernameChange = useCallback((evt) => {
        setUsername(evt.target.value);
    });
    const handlePasswordChange = useCallback((evt) => {
        setPassword(evt.target.value);
    });
    const handleFormSubmit = useCallback(async (evt) => {
        evt.preventDefault();
        try {
            let credentials = { username, password };
            if (username.indexOf('@') !== -1) {
                credentials = { email: username, password };
            }
            await django.logIn(credentials);
        } catch (err) {
            setError(err);
        }
    }, [ django ]);

    return (
        <div className="login-form">
            {renderError()}
            <form onSubmit={handleFormSubmit}>
                <div className="label">Username or E-mail:</div>
                <div className="field">
                    <input type="text" value={username} onChange={handleUsernameChange} />
                </div>
                <div className="label">Password:</div>
                <div className="field">
                    <input type="password" value={password} onChange={handlePasswordChange} />
                </div>
                <div className="buttons">
                    <button type="submit" disabled={disabled}>
                        Log in
                    </button>
                </div>
            </form>
        </div>
    );

    function renderError() {
        if (!error) {
            return null;
        }
        return <div className="error">Error: {error.message}</div>
    }
}

export {
    LoginForm,
};
