import React from 'react'
import { Check } from 'lucide-react'

const ProgressBar = ({ steps, currentStep }) => {
  return (
    <div className="progress-container">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id
        const isCurrent = currentStep === step.id
        const IconComponent = step.icon

        return (
          <div key={step.id} className="progress-step">
            {/* Step Circle */}
            <div className={`progress-circle ${isCompleted ? 'completed' : isCurrent ? 'active' : ''}`}>
              {isCompleted ? (
                <Check style={{ width: '24px', height: '24px' }} />
              ) : (
                <IconComponent style={{ width: '24px', height: '24px' }} />
              )}
            </div>
            
            {/* Step Label */}
            <div className="text-center">
              <div style={{ fontWeight: '600', fontSize: '14px', color: isCurrent ? '#2563eb' : isCompleted ? '#10b981' : '#6b7280' }}>
                {step.name}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', maxWidth: '100px' }}>
                {step.description}
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`progress-line ${currentStep > step.id ? 'completed' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ProgressBar 