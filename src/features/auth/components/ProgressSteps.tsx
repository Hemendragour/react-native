import React from 'react';
import { View, Text } from 'react-native';

interface ProgressStepsProps {
  currentStep: number; // 1 to 5
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  const steps = [1, 2, 3, 4, 5];

  return (
    <View className="flex-row items-center justify-center mb-8">
      {steps.map((step, index) => (
        <View key={step} className="flex-row items-center">
          {/* Circle */}
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              step <= currentStep ? 'bg-[#4a3728]' : 'bg-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                step <= currentStep ? 'text-white' : 'text-gray-500'
              }`}
            >
              {step}
            </Text>
          </View>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <View
              className={`w-10 h-1 mx-1 ${
                step < currentStep ? 'bg-[#4a3728]' : 'bg-gray-200'
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );
};

export default ProgressSteps;