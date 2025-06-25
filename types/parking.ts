// Frontend types
export type VehicleType = "government" | "private" | "public"
export type ParkingAlgorithm = "ai" | "random" | "sequential"

export interface ParkingSpot {
  id: number
  floor: number
  isOccupied: boolean
  vehicleType: VehicleType
  licensePlate: string
  arrivalTime: string
  expectedDeparture: string
  allocatedBy?: ParkingAlgorithm // Track which algorithm allocated this spot
}

export interface ParkingData {
  spots: ParkingSpot[]
}

export interface VehicleEntry {
  licensePlate: string
  vehicleType: VehicleType
  arrivalTime: string
  expectedDeparture: string
  stayDuration: number
  algorithm?: ParkingAlgorithm
}

export interface AlgorithmPerformance {
  algorithm: ParkingAlgorithm
  totalAllocations: number
  averageWalkingDistance: number
  spaceUtilization: number
  allocationTime: number
  vehicleTypeOptimization: number
  overallScore: number
}

export interface AlgorithmComparison {
  ai: AlgorithmPerformance
  random: AlgorithmPerformance
  sequential: AlgorithmPerformance
}

// API types
export interface ApiParkingSpot {
  id: number
  floor: number
  status: "available" | "occupied"
  vehicle_plate_num?: string
  vehicle_plate_type?: number // 0=Private, 1=Public, 2=Govt
  vehicle_type?: number // 0=Car, 1=Truck, 2=Motorcycle
  arrival_time?: string
  departure_time?: string
  allocated_by?: string // "ai", "random", "sequential"
}

export interface ApiParkingStatus {
  spots: ApiParkingSpot[]
  timestamp: string
}

export interface ApiAllocationRequest {
  vehicle_plate_num: string
  vehicle_plate_type: number // 0=Private, 1=Public, 2=Govt
  vehicle_type: number // 0=Car, 1=Truck, 2=Motorcycle
  arrival_time: string
  departure_time: string
  priority_level: number
  algorithm: string // "ai", "random", "sequential"
}

export interface ApiAllocationResponse {
  success: boolean
  spot_id: number
  floor: number
  message: string
  algorithm_used: string
  allocation_metrics: {
    walking_distance: number
    allocation_time: number
    space_efficiency: number
  }
}

export interface ApiVehicleExitRequest {
  vehicle_plate_num: string
  exit_time: string
}

export interface ApiVehicleExitResponse {
  success: boolean
  vehicle_plate_num: string
  parking_duration: string
  parking_fee: number
  message: string
}

export interface ApiParkingStatistics {
  total_spots: number
  occupied_spots: number
  available_spots: number
  occupancy_rate: number
  vehicle_types: {
    government: number
    private: number
    public: number
  }
  floor_statistics: {
    floor: number
    total: number
    occupied: number
    available: number
    occupancy_rate: number
  }[]
  algorithm_performance: {
    ai: AlgorithmPerformance
    random: AlgorithmPerformance
    sequential: AlgorithmPerformance
  }
}

export interface ApiVehicleHistoryEntry {
  vehicle_plate_num: string
  vehicle_plate_type: number
  vehicle_type: number
  arrival_time: string
  departure_time: string
  parking_duration: string
  parking_fee: number
  spot_id: number
  floor: number
  allocated_by: string
}

export interface ApiVehicleHistory {
  history: ApiVehicleHistoryEntry[]
}
