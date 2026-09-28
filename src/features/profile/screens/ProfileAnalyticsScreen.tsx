import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, UserCircle } from 'lucide-react-native';
import AuthService from '../../../services/auth.service';

function formatTimeAgo(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
}

export default function ProfileAnalyticsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const userId = route.params?.userId; // Defaults to current user via backend if omitted

    const [views, setViews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchViews = async () => {
            setLoading(true);
            try {
                // Fetch profile views, passing isPremium=true to get detailed info
                const response = await AuthService.getWhoViewedProfile(1, 50, true);
                if (response?.data?.views) {
                    setViews(response.data.views);
                } else if (response?.views) {
                    setViews(response.views);
                } else {
                    setViews([]);
                }
            } catch (err: any) {
                console.error('Failed to load profile views', err);
                setError('Could not load profile views');
            } finally {
                setLoading(false);
            }
        };

        fetchViews();
    }, []);

    const renderItem = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity 
                activeOpacity={0.8}
                className="flex-row items-center bg-white p-4 mb-2 rounded-xl shadow-sm mx-4"
                onPress={() => {
                    if (item.viewerId && !item.isAnonymous) {
                        navigation.navigate('Profile', { userId: item.viewerId });
                    }
                }}
            >
                {item.viewerPhotoUrl ? (
                    <Image source={{ uri: item.viewerPhotoUrl }} className="w-12 h-12 rounded-full" />
                ) : (
                    <UserCircle size={48} color="#9ca3af" />
                )}
                
                <View className="ml-4 flex-1">
                    <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                        {item.viewerName || (item.isAnonymous ? 'Anonymous Viewer' : 'LinkedIn Member')}
                    </Text>
                    {item.viewerHeadline && (
                        <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
                            {item.viewerHeadline}
                        </Text>
                    )}
                    <Text className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(item.viewedAt)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 ml-4">Profile Views</Text>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4a3728" />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-500">{error}</Text>
                </View>
            ) : views.length === 0 ? (
                <View className="flex-1 justify-center items-center p-6">
                    <UserCircle size={64} color="#d1d5db" />
                    <Text className="text-lg font-semibold text-gray-700 mt-4">No views yet</Text>
                    <Text className="text-sm text-gray-500 text-center mt-2">
                        When people view your profile, they will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={views}
                    keyExtractor={(item, index) => `${item.viewerId || 'anon'}-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
