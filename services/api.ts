import type {
  ApiAllocationRequest,
  ApiAllocationResponse,
  ApiParkingStatus,
  ApiVehicleExitRequest,
  ApiVehicleExitResponse,
  ParkingData,
  VehicleEntry,
  VehicleType,
  ParkingAlgorithm,
} from "@/types/parking"

const API_BASE_URL = "http://localhost:8000/api"

/**
 * Fetches the current parking status from the API
 */
export async function fetchParkingStatus(): Promise<ParkingData> {
  try {
    const response = await fetch(`${API_BASE_URL}/parking/status`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: ApiParkingStatus = await response.json()

    // Transform API data to frontend model
    return transformApiStatusToFrontend(data)
  } catch (error) {
    console.error("Error fetching parking status:", error)
    throw error
  }
}

/**
 * Allocates a parking spot for a vehicle using the specified algorithm
 */
export async function allocateParking(
  vehicleEntry: VehicleEntry,
  algorithm: ParkingAlgorithm = "ai",
): Promise<ApiAllocationResponse> {
  try {
    const payload: ApiAllocationRequest = {
      vehicle_plate_num: vehicleEntry.licensePlate,
      vehicle_plate_type: mapVehicleTypeToApi(vehicleEntry.vehicleType),
      vehicle_type: vehicleEntry.vehicleType === "public" ? 1 : 0,
      arrival_time: new Date().toISOString(),
      departure_time: calculateDepartureTime(vehicleEntry.stayDuration),
      priority_level: vehicleEntry.vehicleType === "government" ? 2 : 1,
      algorithm: algorithm, // Send the selected algorithm to backend
    }

    console.log("Sending allocation request with algorithm:", algorithm)
    console.log("Payload:", payload)

    const response = await fetch(`${API_BASE_URL}/parking/allocate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API allocation error:", response.status, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Allocation response:", result)
    return result
  } catch (error) {
    console.error("Error allocating parking:", error)
    throw error
  }
}

/**
 * Processes a vehicle exit
 */
export async function processVehicleExit(licensePlate: string): Promise<ApiVehicleExitResponse> {
  try {
    const payload: ApiVehicleExitRequest = {
      vehicle_plate_num: licensePlate,
      exit_time: new Date().toISOString(),
    }

    console.log("Processing vehicle exit:", payload)

    const response = await fetch(`${API_BASE_URL}/parking/exit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API exit error:", response.status, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Exit response:", result)
    return result
  } catch (error) {
    console.error("Error processing vehicle exit:", error)
    throw error
  }
}

/**
 * Gets parking statistics including algorithm performance data
 */
export async function getParkingStatistics() {
  try {
    console.log("Fetching parking statistics...")
    const response = await fetch(`${API_BASE_URL}/parking/statistics`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API statistics error:", response.status, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Statistics response:", result)
    return result
  } catch (error) {
    console.error("Error fetching parking statistics:", error)
    throw error
  }
}

/**
 * Gets algorithm comparison data from the backend
 */
export async function getAlgorithmComparison() {
  try {
    console.log("Fetching algorithm comparison data...")
    const response = await fetch(`${API_BASE_URL}/parking/algorithm-comparison`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API algorithm comparison error:", response.status, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Algorithm comparison response:", result)
    return result
  } catch (error) {
    console.error("Error fetching algorithm comparison:", error)
    // Return mock data if API fails
    console.log("Falling back to mock data for algorithm comparison")
    return getMockAlgorithmComparison()
  }
}

/**
 * Gets vehicle history with algorithm information
 */
export async function getVehicleHistory(licensePlate: string) {
  try {
    console.log("Fetching vehicle history for:", licensePlate)
    const response = await fetch(`${API_BASE_URL}/vehicle/history?plate=${encodeURIComponent(licensePlate)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API vehicle history error:", response.status, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Vehicle history response:", result)
    return result
  } catch (error) {
    console.error("Error fetching vehicle history:", error)
    throw error
  }
}

/**
 * Resets algorithm comparison data on the backend
 */
export async function resetAlgorithmComparison() {
  try {
    console.log("Resetting algorithm comparison data...")
    const response = await fetch(`${API_BASE_URL}/parking/algorithm-comparison/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API reset comparison error:", response.status, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Reset comparison response:", result)
    return result
  } catch (error) {
    console.error("Error resetting algorithm comparison:", error)
    throw error
  }
}

/**
 * Sets the active algorithm for comparison mode
 */
export async function setActiveAlgorithm(algorithm: ParkingAlgorithm) {
  try {
    console.log("Setting active algorithm:", algorithm)
    const response = await fetch(`${API_BASE_URL}/parking/algorithm/set-active`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ algorithm }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API set algorithm error:", response.status, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Set algorithm response:", result)
    return result
  } catch (error) {
    console.error("Error setting active algorithm:", error)
    throw error
  }
}

/**
 * Gets the current active algorithm from the backend
 */
export async function getActiveAlgorithm(): Promise<{ algorithm: ParkingAlgorithm }> {
  try {
    console.log("Fetching active algorithm...")
    const response = await fetch(`${API_BASE_URL}/parking/algorithm/active`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API get algorithm error:", response.status, errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Active algorithm response:", result)
    return result
  } catch (error) {
    console.error("Error fetching active algorithm:", error)
    // Return default algorithm if API fails
    return { algorithm: "ai" }
  }
}

// Helper functions

/**
 * Transforms API parking status to frontend model
 */
function transformApiStatusToFrontend(apiData: ApiParkingStatus): ParkingData {
  return {
    spots: apiData.spots.map((spot) => ({
      id: spot.id,
      floor: spot.floor,
      isOccupied: spot.status === "occupied",
      vehicleType: spot.vehicle_plate_type !== undefined ? mapVehicleTypeFromApi(spot.vehicle_plate_type) : "private",
      licensePlate: spot.vehicle_plate_num || "",
      arrivalTime: spot.arrival_time
        ? new Date(spot.arrival_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
      expectedDeparture: spot.departure_time
        ? new Date(spot.departure_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
      allocatedBy: spot.allocated_by as ParkingAlgorithm,
    })),
  }
}

/**
 * Maps vehicle type from API to frontend model
 */
export function mapVehicleTypeFromApi(apiVehicleType: number): VehicleType {
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

/**
 * Maps vehicle type from frontend to API model
 */
export function mapVehicleTypeToApi(vehicleType: VehicleType): number {
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

/**
 * Calculates departure time based on stay duration
 */
function calculateDepartureTime(stayDurationHours: number): string {
  const departureTime = new Date()
  departureTime.setHours(departureTime.getHours() + stayDurationHours)
  return departureTime.toISOString()
}

/**
 * Mock algorithm comparison data for fallback
 */
function getMockAlgorithmComparison() {
  return {
    ai: {
      algorithm: "ai",
      totalAllocations: 0,
      averageWalkingDistance: 0,
      spaceUtilization: 0,
      allocationTime: 0,
      vehicleTypeOptimization: 0,
      overallScore: 0,
    },
    random: {
      algorithm: "random",
      totalAllocations: 0,
      averageWalkingDistance: 0,
      spaceUtilization: 0,
      allocationTime: 0,
      vehicleTypeOptimization: 0,
      overallScore: 0,
    },
    sequential: {
      algorithm: "sequential",
      totalAllocations: 0,
      averageWalkingDistance: 0,
      spaceUtilization: 0,
      allocationTime: 0,
      vehicleTypeOptimization: 0,
      overallScore: 0,
    },
  }
}
