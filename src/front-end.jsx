import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useEventTime } from 'relaks';
import { Django } from 'django';
import { LoginForm } from 'login-form';
import { LogoutButton } from 'logout-button';
import { TodoList } from 'todo-list';
import { ErrorBoundary } from 'error-boundary';

import 'style.scss';

function FrontEnd(props) {
    const { dataSource } = props;
    const [ dataChanged, setDataChanged ] = useEventTime();
    const [ authenticating, setAuthenticating ] = useState(false);
    const django = useMemo(() => {
        return new Django(dataSource);
    }, [ dataSource, dataChanged ])
    if (dataChanged) {
        console.log(dataChanged.toISOString());
    }

    const handleDataSourceAuthentication = useCallback(async (evt) => {
        let token = sessionStorage.token;
        let success = await django.authorize(token);
        if (!success) {
            delete sessionStorage.token;
            setAuthenticating(true);
        }
    });
    const handleDataSourceAuthorization = useCallback((evt) => {
        if (evt.fresh) {
            sessionStorage.token = evt.token;
            setAuthenticating(false);
        }
    });
    const handleDataSourceDeauthorization = useCallback((evt) => {
        delete sessionStorage.token;
    });

    useEffect(() => {
        dataSource.addEventListener('change', setDataChanged);
        dataSource.addEventListener('authentication', handleDataSourceAuthentication);
        dataSource.addEventListener('authorization', handleDataSourceAuthorization);
        dataSource.addEventListener('deauthorization', handleDataSourceDeauthorization);
        return () => {
            dataSource.removeEventListener('change', setDataChanged);
            dataSource.removeEventListener('authentication', handleDataSourceAuthentication);
            dataSource.removeEventListener('authorization', handleDataSourceAuthorization);
            dataSource.removeEventListener('deauthorization', handleDataSourceDeauthorization);
        };
    }, [ dataSource ])

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

export {
    FrontEnd
};
