// features/profile/components/ProfessionalJourney.tsx

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Helper ───────────────────────────────────────────────────────────────────

const toTitleCase = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(/(\s|-|\.)/g)
    .map((word) => (word.match(/^(\s|-|\.)$/) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface JourneyItem {
  type: 'work' | 'education';
  title: string;
  role: string;
  company: string;
  period: string;
}

interface ProfessionalJourneyProps {
  userProfileData?: any;
  educationList?: any[];
  experienceList?: any[];
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_ITEMS: JourneyItem[] = [
  {
    type: 'work',
    title: 'Thronet Technology',
    role: 'Full-Stack Developer',
    company: 'Throne8',
    period: '2023 – Present',
  },
  {
    type: 'education',
    title: 'Oriental College of Technology',
    role: 'Bachelor of Technology',
    company: 'Computer Science & Engineering',
    period: '2016 – 2020',
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const BuildingIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      stroke="#f6ede8"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GraduationIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 14l9-5-9-5-9 5 9 5z"
      stroke="#f6ede8"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      stroke="#f6ede8"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Journey Card ─────────────────────────────────────────────────────────────

const JourneyCard = ({ item }: { item: JourneyItem }) => (
  <View className="bg-white/40 rounded-2xl p-3 mb-2.5 border-2 border-dashed border-[#d4c4b5]">

    {/* Top row — title + icon badge */}
    <View className="flex-row items-start justify-between">
      <Text
        className="text-[#4a3728] text-sm font-bold flex-1 pr-2 leading-5"
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {/* Icon badge */}
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: item.type === 'work' ? '#4a3728' : '#6b4e3d' }}
      >
        {item.type === 'work' ? <BuildingIcon /> : <GraduationIcon />}
      </View>
    </View>

    {/* Role */}
    <Text className="text-[#6b4e3d] text-xs font-semibold mt-1">
      {toTitleCase(item.role)}
    </Text>

    {/* Company / field */}
    {item.company ? (
      <Text className="text-[#8b6f47] text-xs mt-0.5">
        {toTitleCase(item.company)}
      </Text>
    ) : null}

    {/* Period with dot */}
    <View className="flex-row items-center gap-1.5 mt-2">
      <View className="w-2 h-2 rounded-full bg-brand-dark" />
      <Text className="text-[#8b6f47] text-xs font-medium">{item.period}</Text>
    </View>

  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfessionalJourney: React.FC<ProfessionalJourneyProps> = ({
  userProfileData,
  educationList = [],
  experienceList = [],
}) => {

  // ── Build items from real data ───────────────────────────────────────────
  const journeyItems: JourneyItem[] = [];

  if (experienceList.length > 0) {
    const exp       = experienceList.find((e: any) => e.current) || experienceList[0];
    const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : '';
    const endYear   = exp.endDate   ? new Date(exp.endDate).getFullYear()   : 'Present';
    journeyItems.push({
      type: 'work',
      title:   exp.company  || 'Company',
      role:    exp.position || 'Position',
      company: exp.company  || '',
      period:  startYear ? `${startYear} – ${endYear}` : 'Present',
    });
  } else if (userProfileData?.onboarding?.userType === 'working') {
    const w         = userProfileData.onboarding.workingProfile;
    const startYear = w?.startDate ? new Date(w.startDate).getFullYear() : '';
    const endYear   = w?.endDate   ? new Date(w.endDate).getFullYear()   : 'Present';
    journeyItems.push({
      type: 'work',
      title:   w?.companyName || 'Company',
      role:    w?.jobTitle    || 'Position',
      company: w?.companyName || '',
      period:  startYear ? `${startYear} – ${endYear}` : 'Present',
    });
  }

  if (educationList.length > 0) {
    const edu       = educationList[0];
    const startYear = edu.startDate ? new Date(edu.startDate).getFullYear() : '';
    const endYear   = edu.isOngoing ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present');
    journeyItems.push({
      type: 'education',
      title:   edu.schoolCollegeName || 'College',
      role:    edu.degree            || 'Degree',
      company: edu.specialization    || edu.degreeType || '',
      period:  startYear ? `${startYear} – ${endYear}` : 'Present',
    });
  } else if (userProfileData?.onboarding?.userType === 'student') {
    const e        = userProfileData.onboarding.studentProfile;
    const gradYear = e?.graduationYear ? parseInt(e.graduationYear) : new Date().getFullYear();
    journeyItems.push({
      type: 'education',
      title:   e?.collegeName  || 'College',
      role:    e?.degree       || 'Degree',
      company: e?.fieldOfStudy || '',
      period:  `${gradYear - 4} – ${gradYear}`,
    });
  }

  const displayItems = journeyItems.length > 0 ? journeyItems : DUMMY_ITEMS;
  const isWorking    = displayItems.some(i => i.type === 'work');

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View className="mx-3 mb-6">
      <View className="bg-[#f6ede8]/80  rounded-2xl p-5 shadow-md border border-[#d4c4b5]  shadow-black/90 elevation-xl">

        {/* Two column layout */}
        <View className="flex-row gap-3 items-start">

          {/* ── Left — title + description ──────────────────────────── */}
          <View className="flex-1 gap-2 pt-1">

            

            {/* Big heading */}
            <Text
              className="text-[#4a3728] font-black leading-tight"
              style={{ fontSize: 24, letterSpacing: -0.5 }}
            >
              Professional{'\n'}Journey
            </Text>

            {/* Underline bar */}
            <View className="w-10 h-0.5 bg-brand-dark rounded-full -mt-1" />

            {/* Description */}
            <Text className="text-[#6b4e3d] text-xs font-medium leading-relaxed mt-1">
              {isWorking
                ? 'Full-Stack Engineer crafting scalable systems and beautiful experiences at a rising tech startup.'
                : 'Pursuing excellence in education and preparing for a bright future.'}
            </Text>
          </View>

          {/* ── Right — cards ───────────────────────────────────────── */}
          <View className="flex-1">
            {displayItems.map((item, idx) => (
              <JourneyCard key={idx} item={item} />
            ))}
          </View>

        </View>
      </View>
    </View>
  );
};

export default ProfessionalJourney;