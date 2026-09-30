import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

interface HeroSectionProps {
  onSearch?: (query: string, location: string) => void;
  stats?: {
    roles: number;
    companies: number;
    applicants: number;
  };
}

export function HeroSection({ onSearch, stats }: HeroSectionProps) {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [showLocations, setShowLocations] = useState(false);
  const { width } = useWindowDimensions();

  const COMMON_LOCATIONS = [
    'Remote', 
    'Bangalore, Karnataka, India', 
    'Mumbai, Maharashtra, India', 
    'Delhi, Delhi, India', 
    'Gurgaon, Haryana, India',
    'Noida, Uttar Pradesh, India',
    'Hyderabad, Telangana, India',
    'Chennai, Tamil Nadu, India',
    'Pune, Maharashtra, India',
    'Ahmedabad, Gujarat, India',
    'Kolkata, West Bengal, India'
  ];
  
  const filteredLocations = COMMON_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(location.toLowerCase())
  ).slice(0, 4);

  const isSmall = width < 360;
  const titleSize = isSmall ? 28 : width < 400 ? 32 : 38;
  const px = isSmall ? 16 : 20;

  const trending = ['Product Designer', 'Frontend', 'Remote', 'AI / ML'];

  return (
    <View style={[styles.container, { paddingHorizontal: px }]}>
      <Text style={styles.title}>Find Your Next Opportunity</Text>

      <Text style={styles.description}>
        Discover curated roles at top-tier companies and high-growth startups.
      </Text>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {[
          { n: stats ? `${stats.roles > 0 ? stats.roles : 0}` : '200+', l: 'ROLES' },
          { n: stats ? `${stats.companies > 0 ? stats.companies : 0}` : '80+', l: 'COMPANIES' },
          { n: stats ? `${stats.applicants >= 1000 ? (stats.applicants / 1000).toFixed(1) + 'k+' : stats.applicants}` : '12k+', l: 'APPLICANTS' },
        ].map(({ n, l }) => (
          <View key={l} style={styles.statBox}>
            <Text style={[styles.statNumber, { fontSize: isSmall ? 15 : 18 }]}>{n}</Text>
            <Text style={styles.statLabel}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Role or skill..."
            placeholderTextColor="#9a8775"
            value={role}
            onChangeText={setRole}
          />
        </View>
        <View style={styles.divider} />
        <View style={[styles.searchInputWrapper, { zIndex: 10 }]}>
          <Text style={styles.searchIcon}>📍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Location"
            placeholderTextColor="#9a8775"
            value={location}
            onChangeText={setLocation}
            onFocus={() => setShowLocations(true)}
            onBlur={() => setTimeout(() => setShowLocations(false), 200)}
          />
          {showLocations && location.length > 0 && filteredLocations.length > 0 && (
            <View style={styles.suggestionsDropdown}>
              {filteredLocations.map(loc => (
                <TouchableOpacity 
                  key={loc} 
                  style={styles.suggestionItem}
                  onPress={() => {
                    setLocation(loc);
                    setShowLocations(false);
                  }}
                >
                  <Text style={styles.suggestionText}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.searchBtn, { zIndex: 1 }]}
          onPress={() => onSearch && onSearch(role, location)}
          activeOpacity={0.85}
        >
          <Text style={styles.searchBtnText}>Search Jobs</Text>
        </TouchableOpacity>
      </View>

      {/* Trending */}
      <View style={styles.trendingContainer}>
        <Text style={styles.trendingLabel}>Trending Topics:</Text>
        <View style={styles.trendingTags}>
          {trending.map(tag => (
            <TouchableOpacity 
              key={tag} 
              style={styles.trendingTag} 
              onPress={() => {
                setRole(tag);
                if (onSearch) onSearch(tag, location);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.trendingTagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f3ee',
    paddingTop: 16,
    paddingBottom: 24,
    width: '100%',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8b7355',
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4a3728',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#7a6756',
    lineHeight: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#d4c4b5',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statNumber: {
    fontWeight: '900',
    color: '#4a3728',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8b7355',
    marginTop: 3,
    letterSpacing: 0.8,
  },
  searchContainer: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#d4c4b5',
    borderRadius: 20,
    padding: 10,
    marginTop: 20,
    gap: 8,
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4c4b5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#4a3728',
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#d4c4b5/40',
    marginHorizontal: 12,
  },
  searchBtn: {
    backgroundColor: '#4a3728',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  trendingContainer: {
    marginTop: 16,
  },
  trendingLabel: {
    fontSize: 11,
    color: '#8b7355',
    fontWeight: '700',
    marginBottom: 8,
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingTag: {
    backgroundColor: 'rgba(224, 216, 207, 0.4)',
    borderWidth: 1,
    borderColor: '#d4c4b5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendingTagText: {
    fontSize: 11,
    color: '#4a3728',
    fontWeight: '700',
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d4c4b5',
    marginTop: 4,
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d4c4b5/40',
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a3728',
  },
});
