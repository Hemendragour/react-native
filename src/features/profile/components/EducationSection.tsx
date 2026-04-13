// features/profile/components/EducationSection.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AddEducationModal, { EducationData } from './/modals/AddEducationModal';
import UpdateEducationModal from './/modals/UpdateEducationModal';
import SelectEducationModal from './/modals/SelectEducationModal';
import EducationMenuPopup from './/modals/EducationMenuPopup';

// ─── Dummy Data (matches screenshot 2) ───────────────────────────────────────

const DUMMY_EDUCATION = [
  {
    educationId: '1',
    degreeType: "Bachelor's Degree",
    degree: 'B.Tech in Computer Science',
    schoolCollegeName: 'Oriental College of Technology',
    startDate: '2016-07-01',
    endDate: '2020-06-30',
    isOngoing: false,
    specialization: 'Artificial Intelligence and Software Engineering with emphasis on scalable system design and modern development practices',
    educationType: 'full-time',
    gradeType: 'cgpa',
    gradeValue: '8.5',
    location: 'Bhopal, MP',
    skills: ['AI/ML Focus', 'System Design', 'Software Engineering'],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface EducationSectionProps {
  collegeName?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const GraduationIcon = ({ color = '#fff', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 14l9-5-9-5-9 5 9 5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const EditIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MapPinIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="#8b7355" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="#8b7355" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#8b7355" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BookIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="#8b7355" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DotsIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5h.01M12 12h.01M12 19h.01" stroke="#4a3728" strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

// ─── Format date helper ───────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(
    'en-US', 
    { month: 'short', year: 'numeric' }
  );
};

// ─── Single Education Card ────────────────────────────────────────────────────

const EducationCard = ({
  education,
  onMenuPress,
  onEditPress,
}: {
  education: typeof DUMMY_EDUCATION[0];
  onMenuPress: (id: string) => void;
  onEditPress: (edu: any) => void;
}) => (
  <View className="bg-white/40 rounded-2xl p-4  border-2 border-dashed border-[#d4c4b5]">

    {/* Degree type badge */}
    <View className="bg-brand-dark px-3 py-1 rounded-full self-start mb-3">
      <Text className="text-[#6b4e3d] text-xs font-semibold">{education.degreeType}</Text>
    </View>

    {/* Degree name */}
    <Text className="text-[#4a3728] text-base font-bold mb-2">{education.degree}</Text>

    {/* College + Date row */}
    <View className="flex-row flex-wrap gap-3 mb-3">
      <View className="flex-row items-center gap-1.5">
        <MapPinIcon />
        <Text className="text-[#6b4e3d] text-xs font-medium">{education.schoolCollegeName}</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <CalendarIcon />
        <Text className="text-[#6b4e3d] text-xs font-medium">
          {formatDate(education.startDate)} – {education.isOngoing ? 'Present' : formatDate(education.endDate || '')}
        </Text>
      </View>
    </View>

    {/* Specialization box */}
    {education.specialization ? (
      <View className="bg-[#4a3728]/5 rounded-xl p-3 border border-[#8b6f47]/20 mb-3">
        <View className="flex-row items-start gap-2">
          <View className="mt-0.5">
            <BookIcon />
          </View>
          <View className="flex-1">
            <Text className="text-[#6b4e3d] text-xs font-semibold mb-1">Specialization</Text>
            <Text className="text-[#8b6f47] text-xs leading-5">{education.specialization}</Text>
          </View>
        </View>
      </View>
    ) : null}

    {/* Skill tags */}
    {education.skills && education.skills.length > 0 ? (
      <View className="flex-row flex-wrap gap-2">
        {education.skills.map((skill, idx) => (
          <View key={idx} className="px-3 py-1 bg-[#4a3728] rounded-full border border-[#8b6f47]/20">
            <Text className="text-[#f6ede8] text-xs font-medium">{skill}</Text>
          </View>
        ))}
      </View>
    ) : null}

    {/* Menu dots */}
    <TouchableOpacity
      className="absolute top-3 right-3 w-8 h-8 items-center justify-center"
      onPress={() => onMenuPress(education.educationId)}
      activeOpacity={0.7}
    >
      <DotsIcon />
    </TouchableOpacity>

  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EducationSection: React.FC<EducationSectionProps> = ({
  collegeName = '',
  degree = '',
  fieldOfStudy = '',
  graduationYear = '',
}) => {
  const [educationList, setEducationList]                   = useState<any[]>(DUMMY_EDUCATION);
  const [isLoading, setIsLoading]                           = useState(false);
  const [selectedEducation, setSelectedEducation]           = useState<any>(null);
  const [openMenuId, setOpenMenuId]                         = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen]                 = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen]           = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen]           = useState(false);

  // Wire up real data when ready:
  // const { educationList, isLoadingEducation, loadEducation, selectEducation, selectedEducation } = useEducation();
  // useEffect(() => { loadEducation(); }, []);

  const handleAddEducation = async (data: EducationData) => {
    // await loadEducation();   ← uncomment when API ready
    setIsAddModalOpen(false);
  };

  const handleUpdateEducation = (education: any) => {
    setSelectedEducation(education);
    setIsUpdateModalOpen(true);
  };

  const handleOpenUpdate = () => {
    if (educationList.length === 0) return;
    if (educationList.length === 1) {
      handleUpdateEducation(educationList[0]);
    } else {
      setIsSelectModalOpen(true);
    }
  };

  const handleEducationDeleted = () => {
    // reload after delete — replace with loadEducation() when API ready
    setOpenMenuId(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <ScrollView>
    <View className="mx-3 mb-6">
      <View className="bg-[#f6ede8]/80 rounded-3xl p-5 border border-[#e0d8cf]/50">

        {/* ── Header row ──────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between mb-4">

          {/* Title with icon */}
          <View className="flex-row items-center gap-3">
            
            <Text className="text-[#4a3728] text-xl font-bold">Education</Text>
          </View>

          {/* Add + Update buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-row items-center gap-1.5 bg-brand-dark px-3 py-2 rounded-xl"
              onPress={() => setIsAddModalOpen(true)}
              activeOpacity={0.8}
            >
              <PlusIcon />
              <Text className="text-[#4a3728] text-xs font-semibold">Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${educationList.length === 0 ? 'bg-brand-dark/40' : 'bg-brand-dark'}`}
              onPress={handleOpenUpdate}
              disabled={educationList.length === 0}
              activeOpacity={0.8}
            >
              <EditIcon />
              <Text className="text-[#4a3728] text-xs font-semibold">Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Loading ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#4a3728" />
            <Text className="text-brand-medium text-sm mt-2">Loading education...</Text>
          </View>

        /* ── Empty state ──────────────────────────────────────────────── */
        ) : educationList.length === 0 ? (
          <View className="py-8 items-center gap-3">
            <View className="w-16 h-16 rounded-full bg-brand-dark/10 items-center justify-center ">
              <GraduationIcon color="#4a3728" size={28} />
            </View>
            <Text className="text-brand-dark text-base font-semibold">No education added yet</Text>
            <Text className="text-brand-medium text-sm text-center">
              Add your education details to showcase your academic background
            </Text>
            <TouchableOpacity
              className="bg-brand-dark px-6 py-3 rounded-2xl mt-1"
              onPress={() => setIsAddModalOpen(true)}
              activeOpacity={0.8}
            >
              <Text className="text-brand-light text-sm font-semibold">Add Education</Text>
            </TouchableOpacity>
          </View>

        /* ── Education list ───────────────────────────────────────────── */
        ) : (
          <View>
            {educationList.map((edu) => (
              <View key={edu.educationId}>
                <EducationCard
                  education={edu}
                  onMenuPress={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                  onEditPress={handleUpdateEducation}
                />

                {/* Menu popup */}
                <EducationMenuPopup
                  educationId={edu.educationId}
                  isOpen={openMenuId === edu.educationId}
                  onClose={() => setOpenMenuId(null)}
                  onEducationDeleted={handleEducationDeleted}
                />
              </View>
            ))}
          </View>
        )}

      </View>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <AddEducationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEducation}
        prefillData={{ collegeName, degree, fieldOfStudy, graduationYear }}
      />

      <SelectEducationModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        educationList={educationList}
        onSelectEducation={(edu) => {
          handleUpdateEducation(edu);
          setIsSelectModalOpen(false);
        }}
      />

      <UpdateEducationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedEducation(null);
        }}
        educationData={selectedEducation}
        onSubmit={async () => {
          setIsUpdateModalOpen(false);
        }}
      />
    </View>
    </ScrollView>
  );
};

export default EducationSection;