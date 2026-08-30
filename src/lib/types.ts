export type ChecklistKey =
  | 'calories'
  | 'protein'
  | 'steps'
  | 'gym'
  | 'noSugar'
  | 'sleep'

export interface DailyLog {
  date: string // yyyy-mm-dd
  weightKg?: number
  waistCm?: number
  calories?: number
  proteinG?: number
  steps?: number
  checklist: Partial<Record<ChecklistKey, boolean>>
  note?: string
}

export interface SetLog {
  weight: number
  reps: number
}

export interface ExerciseLog {
  exerciseName: string
  sets: SetLog[]
  note?: string
}

export interface WorkoutLog {
  date: string // yyyy-mm-dd
  dayKey: DayKey
  exercises: ExerciseLog[]
  completed: boolean
}

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface WeeklySummary {
  weekStart: string
  avgWeightKg?: number
  waistCm?: number
  avgCalories?: number
  avgProteinG?: number
  avgSteps?: number
  gymDaysCompleted?: number
}

export type AdjustStatus = 'hold' | 'watch' | 'adjust'

export interface GroceryItemState {
  id: string
  walmartPrice?: number
  walmartLastUpdated?: string
  weeePrice?: number
  weeeLastUpdated?: string
}

export interface AppSettings {
  zip: string
  budgetCeilingMonthly: number
  budgetSoftWeekly: number
  serverUrl: string
}

export interface AppState {
  dailyLogs: Record<string, DailyLog>
  workoutLogs: Record<string, WorkoutLog>
  groceryState: Record<string, GroceryItemState>
  settings: AppSettings
}
