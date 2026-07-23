import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        } else {
            router.replace('/(auth)/welcome');
        }
    }, [isAuthenticated, router]);

    return <View style={{ flex: 1, backgroundColor: '#090A0C' }} />;
}
