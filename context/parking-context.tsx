"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ParkingData, VehicleEntry } from "@/types/parking"

// Initial empty parking data structure
const emptyParkingData: ParkingData = {
  spots: [],
}

interface ParkingContextType {
  parkingData: ParkingData
  allocateParking: (entry: VehicleEntry) => Promise<{
    success: boolean
    floor?: number
    spot?: number
    message: string
  }>
  fetchParkingStatus: () => Promise<void>
  isLoading: boolean
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined)

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [parkingData, setParkingData] = useState<ParkingData>(emptyParkingData)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Fetch parking status from the API
  const fetchParkingStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/parking/status")
      if (!response.ok) {
        throw new Error("Failed to fetch parking status")
      }

      const data = await response.json()

      // Transform the API data to match our frontend model
      // This is a placeholder - you'll need to adjust based on the actual API response
      const transformedData: ParkingData = {
        spots: data.spots.map((spot: any) => ({
          id: spot.id,
          floor: spot.floor,
          isOccupied: spot.status === "occupied",
          vehicleType: mapVehicleTypeFromApi(spot.vehicle_plate_type),
          licensePlate: spot.vehicle_plate_num || "",
          arrivalTime: spot.arrival_time
            ? new Date(spot.arrival_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
          expectedDeparture: spot.departure_time
            ? new Date(spot.departure_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
        })),
      }

      setParkingData(transformedData)
    } catch (error) {
      console.error("Error fetching parking status:", error)
      // Fallback to empty data if API fails
      setParkingData(emptyParkingData)
    } finally {
      setIsLoading(false)
    }
  }

  // Map vehicle type from API to frontend model
  const mapVehicleTypeFromApi = (apiVehicleType: number): "government" | "private" | "public" => {
    switch (apiVehicleType) {
      case 2:
        return "government"
      case 1:
        return "public"
      case 0:
      default:
        return "private"
    }
  }

  // Map vehicle type from frontend to API model
  const mapVehicleTypeToApi = (vehicleType: "government" | "private" | "public"): number => {
    switch (vehicleType) {
      case "government":
        return 2
      case "public":
        return 1
      case "private":
      default:
        return 0
    }
  }

  // Fetch parking status on component mount
  useEffect(() => {
    fetchParkingStatus()
  }, [])

  // Allocate parking using the API
  const allocateParking = async (entry: VehicleEntry) => {
    setIsLoading(true)
    try {
      // Calculate arrival and departure times in ISO format
      const now = new Date()
      const arrivalTime = now.toISOString()

      // Calculate departure time based on stay duration
      const departureTime = new Date(now.getTime() + entry.stayDuration * 60 * 60 * 1000).toISOString()

      const payload = {
        vehicle_plate_num: entry.licensePlate,
        vehicle_plate_type: mapVehicleTypeToApi(entry.vehicleType),
        vehicle_type: 0, // Default to Car (0)
        arrival_time: arrivalTime,
        departure_time: departureTime,
        priority_level: entry.vehicleType === "government" ? 2 : 1, // Higher priority for government vehicles
      }

      const response = await fetch("http://localhost:8000/api/parking/allocate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to allocate parking")
      }

      const data = await response.json()

      // Refresh parking status after allocation
      await fetchParkingStatus()

      return {
        success: true,
        floor: data.floor,
        spot: data.spot_id,
        message: `Vehicle ${entry.licensePlate} has been allocated to Floor ${data.floor + 1}, Spot ${data.spot_id}.`,
      }
    } catch (error) {
      console.error("Error allocating parking:", error)
      return {
        success: false,
        message: "Failed to allocate parking. Please try again.",
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ParkingContext.Provider value={{ parkingData, allocateParking, fetchParkingStatus, isLoading }}>
      {children}
    </ParkingContext.Provider>
  )
}

export function useParkingContext() {
  const context = useContext(ParkingContext)
  if (context === undefined) {
    throw new Error("useParkingContext must be used within a ParkingProvider")
  }
  return context
}
