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

