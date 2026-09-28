import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Building2 } from 'lucide-react-native';
import { Company } from '../types/network.types';
import CompanyCard from './CompanyCard';
import PersonCardLoader from './PersonCardLoader';

const C = { dark: '#4a3728' };

const SuggestionsForCompaniesSection: React.FC<{
  companies?: Company[];
  followingCompanies?: Set<string>;
  onFollow: (id: string) => void;
  isLoading?: boolean;
}> = ({ companies = [], followingCompanies = new Set(), onFollow, isLoading = false }) => {
  const [showAll, setShowAll] = useState(false);
  const safeCompanies = Array.isArray(companies) ? companies : [];
  const displayed = showAll ? safeCompanies : safeCompanies.slice(0, 4);

  return (
    <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
      <View className="flex-row items-center justify-between mb-4 gap-x-2">
        <View className="flex-row items-center gap-x-2.5 flex-1 min-w-0 pr-1">
          <View className="w-9 h-9 rounded-xl bg-[#f6ede8] items-center justify-center shrink-0">
            <Building2 size={18} color={C.dark} />
          </View>
          <Text
            className="text-sm font-black text-[#4a3728] flex-1"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Suggestions for Companies
          </Text>
        </View>
        {safeCompanies.length > 4 && (
          <TouchableOpacity
            onPress={() => setShowAll(p => !p)}
            activeOpacity={0.8}
            className="bg-[#f6ede8] px-2.5 py-1.5 rounded-xl border border-[#4a3728]/20 shrink-0"
          >
            <Text className="text-[11px] font-bold text-[#4a3728]">
              {showAll ? 'Hide ▲' : 'See all →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {[0, 1, 2, 3].map(i => <View key={i} className='w-[48%]'><PersonCardLoader /></View>)}
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {displayed.map(c => (
            <View key={c.id || Math.random().toString()} className='w-[48%]'>
              <CompanyCard company={c} isFollowing={followingCompanies.has(c.id)} onFollow={onFollow} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default SuggestionsForCompaniesSection;
