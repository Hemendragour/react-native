import {  TouchableOpacity, View ,Text} from 'react-native'
import React, { useState } from 'react'
import OpenToModal from '../components/modals/OpenToModal'
import AddProfileSectionModal from '../components/modals/AddProfileSectionModal'
import EnhanceProfileModal from '../components/modals/EnhanceProfileModal'
import ResourcesModal from '../components/modals/ResourcesModal'

const ProfileActions: React.FC = () => {
  const [openToOpen, setOpenToOpen] = useState(false);
  const [addProfileSectionOpen, setAddProfileSectionOpen] = useState(false);
  const [enhanceProfileOpen, setEnhanceProfileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
 const buttons = [
    { label: 'Open to', onPress: () => setOpenToOpen(true) },
    { label: 'Add profile section', onPress: () => setAddProfileSectionOpen(true) },
    { label: 'Enhance profile', onPress: () => setEnhanceProfileOpen(true) },
    { label: 'Resources', onPress: () => setResourcesOpen(true) },
  ];
return(
  <>
  <View className="bg-[#f6ede8]/80 rounded-2xl  px-4 h-44 py-4 mx-3 mb-8 border border-[#e0d8cf]/50 shadow-lg shadow-black/90 elevation-2xl">
    <View className="flex-row flex-wrap gap-2">
      {buttons.map((button)=>(
        <TouchableOpacity
        key={button.label}
        onPress={button.onPress}
        activeOpacity={0.8}
        className="bg-[#4a3728] rounded-xl px-4 py-3 flex-1 min-w-[40%] items-center justify-center flex">
           <Text className="text-[#f6ede8] font-semibold text-sm text-center w-full">
                {button.label}
              </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
  <OpenToModal isOpen={openToOpen} onClose={() => setOpenToOpen(false)} />
    <AddProfileSectionModal isOpen={addProfileSectionOpen} onClose={() => setAddProfileSectionOpen(false)} />
      <EnhanceProfileModal isOpen={enhanceProfileOpen} onClose={() => setEnhanceProfileOpen(false)} />
        <ResourcesModal isOpen={resourcesOpen} onClose={() => setResourcesOpen(false)} />
  </>
)
}

export default ProfileActions
