import { create } from 'zustand'
import { ApplyFilters } from '@/types/filters'
import { storage } from '@/utils/storage'

interface FiltersState {
  filters: ApplyFilters | null
  loadFilters: () => void
  updateFilters: (filters: ApplyFilters) => void
  resetFilters: () => void
}

const defaultFilters: ApplyFilters = {
  blacklist: {
    companies: [],
    keywords: [],
    locations: [],
    industries: [],
  },
  whitelist: {
    companies: [],
    keywords: [],
    locations: [],
  },
  salary: {
    min: 80000,
    max: 250000,
    target: 120000,
    currency: 'USD',
  },
  workType: {
    remote: true,
    hybrid: true,
    onsite: true,
    acceptOvertimeOccasionally: true,
  },
  jobRequirements: {
    minYearsExperience: 0,
    maxYearsExperience: 10,
    levels: [],
    excludeLevels: [],
  },
  techStack: {
    mustHave: [],
    niceToHave: [],
    dealBreakers: [],
  },
  companyPreferences: {
    sizes: [],
    types: [],
    excludeTypes: [],
    fundingStage: [],
  },
  autoRules: {
    autoApply: {
      enabled: false,
    },
    autoSkip: {
      enabled: true,
    },
    requireManualReview: [],
  },
  benefits: {
    mustHave: [],
    preferred: [],
    dealBreakers: [],
  },
  other: {},
}

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: storage.getFilters() || defaultFilters,
  loadFilters: () => {
    const filters = storage.getFilters() || defaultFilters
    set({ filters })
  },
  updateFilters: (filters) => {
    storage.setFilters(filters)
    set({ filters })
  },
  resetFilters: () => {
    storage.setFilters(defaultFilters)
    set({ filters: defaultFilters })
  },
}))
