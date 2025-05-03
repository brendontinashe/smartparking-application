export type VehicleType = "government" | "private" | "public"

export interface ParkingSpot {
  id: number
  floor: number
  isOccupied: boolean
  vehicleType: VehicleType
  licensePlate: string
  arrivalTime: string
  expectedDeparture: string
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
}

export interface ApiAllocationRequest {
  vehicle_plate_num: string
  vehicle_plate_type: number
  vehicle_type: number
  arrival_time: string
  departure_time: string
  priority_level: number
}

export interface ApiAllocationResponse {
  success: boolean
  spot_id: number
  floor: number
  message: string
}
