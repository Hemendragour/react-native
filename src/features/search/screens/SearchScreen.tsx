import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft, Search as SearchIcon, User } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamlist } from '../../auth/types/Types';
import AuthService from '../../../services/auth.service';

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

type SearchScreenRouteProp = RouteProp<AppStackParamlist, 'Search'>;
type SearchScreenNavigationProp = NativeStackNavigationProp<AppStackParamlist, 'Search'>;

export default function SearchScreen() {
  const route = useRoute<SearchScreenRouteProp>();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const initialQuery = route.params?.query || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search effect for LinkedIn-style live suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await AuthService.searchUsers(queryToSearch);
      const results = response?.data || response?.users || [];
      const parsedResults = Array.isArray(results) ? results : Array.isArray(results.users) ? results.users : [];
      setSearchResults(parsedResults);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderSearchResultItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-row items-center p-3.5 bg-white mb-2 mx-4 rounded-2xl border border-[#d4c4b5]/40 shadow-sm"
      activeOpacity={0.7}
      onPress={() => {
        Keyboard.dismiss();
        navigation.navigate('Profile', { userId: item._id || item.id || item.userId } as any);
      }}
    >
      <Image
        source={{ uri: item.profileImage || item.avatar || item.profilePicture || DEFAULT_AVATAR }}
        className="w-14 h-14 rounded-full border border-[#d4c4b5]/50 bg-[#4a3728]/10"
      />
      <View className="ml-3 flex-1 justify-center">
        <Text className="font-bold text-[#4a3728] text-[15px]" numberOfLines={1}>
          {item.firstName ? `${item.firstName} ${item.lastName || ''}`.trim() : item.username}
        </Text>
        {(item.headline || item.role) && (
          <Text className="text-xs text-[#4a3728]/60 mt-0.5" numberOfLines={1}>
            {item.headline || item.role}
          </Text>
        )}
      </View>
      <ChevronLeft className="rotate-180" size={18} color="rgba(74,55,40,0.4)" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView 
      className="flex-1 bg-[#fcfcfc]"
      style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      edges={['top']}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f6ede8" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-[#f6ede8] z-10 border-b border-[#d4c4b5]/30 shadow-sm">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-[#4a3728]/10"
        >
          <ChevronLeft size={28} color="#4a3728" />
        </TouchableOpacity>
        
        <View className="flex-1 flex-row items-center bg-[#fcfcfc] rounded-full px-4 py-2 border border-[#d4c4b5]/80 ml-1">
          <SearchIcon size={18} color="#4a3728" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Throne8..."
            placeholderTextColor="rgba(74,55,40,0.5)"
            className="flex-1 text-[#4a3728] text-[15px] ml-2 p-0 h-full"
            autoFocus={!initialQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              className="p-1 rounded-full active:bg-[#4a3728]/10"
            >
              <Text className="text-[#4a3728]/60 text-[10px] font-black">CLEAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 bg-[#fcfcfc]">
        {isSearching && searchResults.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#4a3728" />
            <Text className="text-[#4a3728]/60 mt-4 font-medium text-sm">Searching for "{searchQuery}"...</Text>
          </View>
        ) : hasSearched ? (
          searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => item._id || item.id || item.userId || `user-${index}`}
              renderItem={renderSearchResultItem}
              contentContainerStyle={{ paddingVertical: 12 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={() => (
                <View className="px-5 pb-3 pt-1">
                  <Text className="text-[#4a3728]/60 font-bold text-[11px] uppercase tracking-wider">
                    {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
                  </Text>
                </View>
              )}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-8">
              <View className="w-20 h-20 bg-[#4a3728]/5 rounded-full items-center justify-center mb-4">
                <SearchIcon size={32} color="#4a3728" />
              </View>
              <Text className="text-[#4a3728] font-bold text-xl mb-2 text-center">No results found</Text>
              <Text className="text-[#4a3728]/60 text-center text-sm leading-relaxed">
                We couldn't find anyone matching "{searchQuery}". Try adjusting your search terms.
              </Text>
            </View>
          )
        ) : (
          <View className="flex-1 justify-center items-center px-8 opacity-60">
            <User size={48} color="#4a3728" className="mb-4" />
            <Text className="text-[#4a3728] font-medium text-center leading-relaxed">
              Search for players, teams, and professionals to connect with on Throne8
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
