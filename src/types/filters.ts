export interface ApplyFilters {
  blacklist: {
    companies: string[]
    keywords: string[]
    locations: string[]
    industries: string[]
  }
  whitelist: {
    companies: string[]
    keywords: string[]
    locations: string[]
  }
  salary: {
    min: number
    max: number
    target: number
    currency: string
    includeEquity?: boolean
    minEquity?: string
  }
  workType: {
    remote: boolean
    hybrid: boolean
    onsite: boolean
    acceptOvertimeOccasionally: boolean
    maxOnsiteDaysPerWeek?: number
  }
  jobRequirements: {
    minYearsExperience: number
    maxYearsExperience: number
    levels: string[]
    excludeLevels: string[]
  }
  techStack: {
    mustHave: string[]
    niceToHave: string[]
    dealBreakers: string[]
  }
  companyPreferences: {
    sizes: string[]
    types: string[]
    excludeTypes: string[]
    fundingStage: string[]
    minFunding?: string
  }
  autoRules: {
    autoApply: {
      enabled: boolean
      conditions?: string
    }
    autoSkip: {
      enabled: boolean
      conditions?: string
    }
    requireManualReview: string[]
  }
  benefits: {
    mustHave: string[]
    preferred: string[]
    dealBreakers: string[]
  }
  visa?: {
    requiresSponsorship: boolean
    currentStatus: string
    acceptsRemoteInternational: boolean
    preferredCountries: string[]
  }
  other: {
    maxCommuteTimeMinutes?: number
    acceptBusinessTravel?: string
    acceptProbationPeriod?: boolean
    maxProbationMonths?: number
    preferredTeamSize?: string
    mustHaveModernDevTools?: boolean
    workingHours?: {
      timezone?: string
      acceptAsyncWork?: boolean
      maxOverlapRequiredHours?: number
    }
  }
  notes?: string
}

export interface JobApplication {
  id: string
  company: string
  position: string
  status: 'applied' | 'skipped' | 'review'
  matchScore?: number
  appliedAt: string
  url?: string
}
