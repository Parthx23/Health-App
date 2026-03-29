'use client'

import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import type { BurnoutForecast } from '@/lib/types'

interface ForecastWarningCardProps {
  forecast: BurnoutForecast
  className?: string
}

export function ForecastWarningCard({ forecast, className = '' }: ForecastWarningCardProps) {
  const { riskLevel, probability, message, recommendation } = forecast

  const config = {
    low: {
      icon: CheckCircle,
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      iconColor: 'text-success',
      textColor: 'text-success',
    },
    moderate: {
      icon: AlertCircle,
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      iconColor: 'text-warning',
      textColor: 'text-warning',
    },
    high: {
      icon: AlertTriangle,
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      iconColor: 'text-destructive',
      textColor: 'text-destructive',
    },
  }[riskLevel]

  const Icon = config.icon

  return (
    <div
      className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 p-2 rounded-lg ${config.bgColor}`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-semibold ${config.textColor}`}>
              Energy Forecast
            </h4>
            {probability > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${config.bgColor} ${config.textColor}`}>
                {probability}% risk
              </span>
            )}
          </div>
          <p className="text-sm text-foreground mb-2">
            {message}
          </p>
          <p className="text-xs text-muted-foreground">
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  )
}
