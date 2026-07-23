import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { AuthService } from '../services/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const isLoading = useAuthStore((state) => state.isLoading);

    useEffect(() => {
        AuthService.initAuth();
    }, []);

    // Optionally show a splash screen or loading state here
    if (isLoading) {
        return <React.Fragment>{children}</React.Fragment>; 
    }

    return <>{children}</>;
}

