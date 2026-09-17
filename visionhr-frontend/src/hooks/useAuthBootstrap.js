import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from '../api/axios.js';
import { authApi } from '../features/auth/authApi.js';
import { setCredentials, setAuthStatus, logoutLocal } from '../features/auth/authSlice.js';

/**
 * On every full page load the Redux store is empty (the access token only
 * ever lives in memory). This silently calls /auth/refresh — which relies
 * on the HttpOnly visionhr_refresh cookie the browser sends automatically —
 * to mint a new access token, then fetches /auth/me to repopulate the user.
 * Mount this once near the root, before the router renders protected routes.
 */
export default function useAuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      dispatch(setAuthStatus('loading'));
      try {
        const refreshRes = await api.post('/auth/refresh');
        const accessToken = refreshRes.data.data.accessToken;
        if (cancelled) return;

        // Temporarily set the token so the /me request below is authenticated
        dispatch(setCredentials({ accessToken, user: null }));

        const me = await authApi.me();
        if (cancelled) return;

        dispatch(
          setCredentials({
            accessToken,
            user: {
              id: me.id,
              email: me.email,
              role: me.role,
              employeeCode: me.employee?.employeeCode,
              fullName: me.employee?.fullName,
              department: me.employee?.organization?.department,
              designation: me.employee?.organization?.designation,
              avatarS3Key: me.employee?.avatarS3Key,
            },
          })
        );
      } catch {
        if (!cancelled) dispatch(logoutLocal());
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
