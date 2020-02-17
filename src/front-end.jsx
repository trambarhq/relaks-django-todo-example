import React, { useState, useMemo, useEffect } from 'react';
import { useEventTime, useListener } from 'relaks';
import { Django } from './django.js';
import { LoginForm } from './login-form.jsx';
import { LogoutButton } from './logout-button.jsx';
import { TodoList } from './todo-list.jsx';
import { ErrorBoundary } from './error-boundary.jsx';

import './style.scss';

function FrontEnd(props) {
  const { dataSource } = props;
  const [ dataChanged, setDataChanged ] = useEventTime();
  const [ authenticating, setAuthenticating ] = useState(false);
  const django = useMemo(() => {
    return new Django(dataSource);
  }, [ dataSource, dataChanged ])

  const handleAuthentication = useListener(async (evt) => {
    const token = sessionStorage.token;
    const success = await django.authorize(token);
    if (!success) {
      delete sessionStorage.token;
      setAuthenticating(true);
    }
  });
  const handleAuthorization = useListener((evt) => {
    if (authenticating) {
      sessionStorage.token = evt.token;
      setAuthenticating(false);
    }
  });
  const handleDeauthorization = useListener((evt) => {
    delete sessionStorage.token;
  });

  useEffect(() => {
    dataSource.addEventListener('change', setDataChanged);
    dataSource.addEventListener('authentication', handleAuthentication);
    dataSource.addEventListener('authorization', handleAuthorization);
    dataSource.addEventListener('deauthorization', handleDeauthorization);
    return () => {
      dataSource.removeEventListener('change', setDataChanged);
      dataSource.removeEventListener('authentication', handleAuthentication);
      dataSource.removeEventListener('authorization', handleAuthorization);
      dataSource.removeEventListener('deauthorization', handleDeauthorization);
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
