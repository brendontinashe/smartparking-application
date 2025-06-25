"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ParkingAlgorithm, AlgorithmComparison } from "@/types/parking"
import {
  getActiveAlgorithm,
  setActiveAlgorithm,
  getAlgorithmComparison,
  resetAlgorithmComparison,
} from "@/services/api"

interface AlgorithmContextType {
  selectedAlgorithm: ParkingAlgorithm
  setSelectedAlgorithm: (algorithm: ParkingAlgorithm) => void
  isComparisonMode: boolean
  setIsComparisonMode: (enabled: boolean) => void
  comparisonData: AlgorithmComparison | null
  setComparisonData: (data: AlgorithmComparison | null) => void
  resetComparison: () => void
  refreshComparisonData: () => Promise<void>
  isLoading: boolean
}

const AlgorithmContext = createContext<AlgorithmContextType | undefined>(undefined)

export function AlgorithmProvider({ children }: { children: ReactNode }) {
  const [selectedAlgorithm, setSelectedAlgorithmState] = useState<ParkingAlgorithm>("ai")
  const [isComparisonMode, setIsComparisonMode] = useState(false)
  const [comparisonData, setComparisonData] = useState<AlgorithmComparison | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load active algorithm from backend on mount
  useEffect(() => {
    const loadActiveAlgorithm = async () => {
      try {
        setIsLoading(true)
        const response = await getActiveAlgorithm()
        console.log("Loaded active algorithm from backend:", response.algorithm)
        setSelectedAlgorithmState(response.algorithm)
      } catch (error) {
        console.error("Failed to load active algorithm:", error)
        // Keep default algorithm if backend fails
      } finally {
        setIsLoading(false)
      }
    }

    loadActiveAlgorithm()
  }, [])

  // Load comparison data on mount
  useEffect(() => {
    refreshComparisonData()
  }, [])

  const setSelectedAlgorithm = async (algorithm: ParkingAlgorithm) => {
    try {
      setIsLoading(true)
      console.log("Setting algorithm to:", algorithm)

      // Update backend
      await setActiveAlgorithm(algorithm)

      // Update local state
      setSelectedAlgorithmState(algorithm)

      console.log("Algorithm successfully set to:", algorithm)
    } catch (error) {
      console.error("Failed to set algorithm:", error)
      // Still update local state even if backend fails
      setSelectedAlgorithmState(algorithm)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshComparisonData = async () => {
    try {
      setIsLoading(true)
      console.log("Refreshing comparison data...")
      const data = await getAlgorithmComparison()
      setComparisonData(data)
      console.log("Comparison data refreshed:", data)
    } catch (error) {
      console.error("Failed to refresh comparison data:", error)
      // Keep existing data if refresh fails
    } finally {
      setIsLoading(false)
    }
  }

  const resetComparison = async () => {
    try {
      setIsLoading(true)
      console.log("Resetting comparison data...")

      // Reset on backend
      await resetAlgorithmComparison()

      // Reset local state
      setComparisonData(null)
      setIsComparisonMode(false)

      console.log("Comparison data reset successfully")
    } catch (error) {
      console.error("Failed to reset comparison data:", error)
      // Still reset local state even if backend fails
      setComparisonData(null)
      setIsComparisonMode(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlgorithmContext.Provider
      value={{
        selectedAlgorithm,
        setSelectedAlgorithm,
        isComparisonMode,
        setIsComparisonMode,
        comparisonData,
        setComparisonData,
        resetComparison,
        refreshComparisonData,
        isLoading,
      }}
    >
      {children}
    </AlgorithmContext.Provider>
  )
}

export function useAlgorithmContext() {
  const context = useContext(AlgorithmContext)
  if (context === undefined) {
    throw new Error("useAlgorithmContext must be used within an AlgorithmProvider")
  }
  return context
}
