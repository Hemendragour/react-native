import { ScrollView, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProfileBanner from '../components/ProfileBanner'
import ProfileHeader from '../components/ProfileHeader'
import AboutSection from '../components/AboutSection'
import ProfileActions from '../components/ProfileActions'
import ExperienceSection from '../components/ExperienceSection'
import ProfessionalJourney from '../components/ProfessionalJourney'
import EducationSection from '../components/EducationSection'
import ActivitySection from '../components/ProfileActivity'
import InterestsSection from '../components/Interest'
import SkillsSection from '../components/SkillSection'
// import AnalyticsDashboard from '../components/Analytics'
//     const userid="user123";

export default function ProfileScreen() {
  return (
    <SafeAreaView classname="flex-1" style={{backgroundColor:"white"}}>
    
    <ScrollView><View>
      <ProfileBanner />
      <ProfileHeader/>
      <ProfileActions/>
      <ProfessionalJourney/>
      <AboutSection/>
      <ExperienceSection/>
      <EducationSection/>
      <SkillsSection/>
      <ActivitySection/>
      <InterestsSection/>
      {/* <AnalyticsDashboard userId={userid}/> */}
    </View>
    </ScrollView>
    </SafeAreaView>
  )
}