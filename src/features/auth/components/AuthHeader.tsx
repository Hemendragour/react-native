import { View, Text } from 'react-native'
import React from 'react'

const AuthHeader:React.FC = () => (
  
    <View className="mb-2">
        <Text className="text-4xl font-black text-[#4a3728] tracking-tight leading-tight">
            Welcome To{'\n'}
            <Text className="text-[#8b7355]">Throne8</Text>
        </Text>
        <Text className="text-sm text-gray-500 mt-3 leading-5">
            Sign in to access your Throne8 journey
        </Text>
      
    </View>
  
)
export default AuthHeader