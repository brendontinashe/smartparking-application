"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { ParkingData, VehicleEntry } from "@/types/parking"

// Initial parking data with 10 spots per floor (4 floors)
const initialParkingData: ParkingData = {
  spots: Array.from({ length: 4 }).flatMap((_, floorIndex) =>
    Array.from({ length: 10 }).map((_, spotIndex) => ({
      id: floorIndex * 10 + spotIndex + 1,
      floor: floorIndex,
      isOccupied: Math.random() > 0.7, // Randomly occupy some spots for demo
      vehicleType: ["government", "private", "public"][Math.floor(Math.random() * 3)] as
        | "government"
        | "private"
        | "public",
      licensePlate: `ABC${Math.floor(Math.random() * 1000)}`,
      arrivalTime: "09:00",
      expectedDeparture: "17:00",
    })),
  ),
}

// Make sure some spots are available for demo
initialParkingData.spots[0].isOccupied = false
initialParkingData.spots[10].isOccupied = false
initialParkingData.spots[20].isOccupied = false
initialParkingData.spots[30].isOccupied = false

interface ParkingContextType {
  parkingData: ParkingData
  allocateParking: (entry: VehicleEntry) => {
    success: boolean
    floor?: number
    spot?: number
    message: string
  }
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined)

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [parkingData, setParkingData] = useState<ParkingData>(initialParkingData)

  // AI-based parking allocation algorithm
  const allocateParking = (entry: VehicleEntry) => {
    // 1. Find all available spots
    const availableSpots = parkingData.spots.filter((spot) => !spot.isOccupied)

    if (availableSpots.length === 0) {
      return {
        success: false,
        message: "No parking spots available. Please try again later.",
      }
    }

    // 2. Apply allocation rules based on vehicle type
    let candidateSpots = [...availableSpots]

    // Government vehicles get priority for lower floors
    if (entry.vehicleType === "government") {
      // Sort by floor (lower floors first)
      candidateSpots.sort((a, b) => a.floor - b.floor)
    }
    // Public vehicles (buses, taxis) get spots closer to exits (higher spot IDs)
    else if (entry.vehicleType === "public") {
      // For this demo, we'll assume higher spot IDs are closer to exits
      candidateSpots.sort((a, b) => b.id - a.id)
    }
    // Private vehicles get distributed based on expected stay duration
    else {
      // Longer stays go to higher floors to keep short-term spots available
      if (entry.stayDuration > 4) {
        candidateSpots = candidateSpots.filter((spot) => spot.floor >= 2)
        if (candidateSpots.length === 0) {
          candidateSpots = [...availableSpots] // Fallback if no spots on higher floors
        }
      } else {
        // Short stays get lower floors for convenience
        candidateSpots = candidateSpots.filter((spot) => spot.floor <= 1)
        if (candidateSpots.length === 0) {
          candidateSpots = [...availableSpots] // Fallback if no spots on lower floors
        }
      }
    }

    // 3. Select the best spot from candidates
    const selectedSpot = candidateSpots[0]

    // 4. Update the parking data
    setParkingData((prev) => {
      const updatedSpots = prev.spots.map((spot) => {
        if (spot.id === selectedSpot.id) {
          return {
            ...spot,
            isOccupied: true,
            vehicleType: entry.vehicleType,
            licensePlate: entry.licensePlate,
            arrivalTime: entry.arrivalTime,
            expectedDeparture: entry.expectedDeparture,
          }
        }
        return spot
      })

      return {
        ...prev,
        spots: updatedSpots,
      }
    })

    // 5. Return the allocation result
    return {
      success: true,
      floor: selectedSpot.floor,
      spot: selectedSpot.id,
      message: `Vehicle ${entry.licensePlate} has been allocated to Floor ${selectedSpot.floor + 1}, Spot ${selectedSpot.id}.`,
    }
  }

  return <ParkingContext.Provider value={{ parkingData, allocateParking }}>{children}</ParkingContext.Provider>
}

export function useParkingContext() {
  const context = useContext(ParkingContext)
  if (context === undefined) {
    throw new Error("useParkingContext must be used within a ParkingProvider")
  }
  return context
}

