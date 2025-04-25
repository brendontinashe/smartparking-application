"use client"

import type React from "react"

import { useState, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { useParkingContext } from "@/context/parking-context"
import ParkingBuilding from "./parking-building"
import ParkingFloorDetails from "./parking-floor-details"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ParkingVisualization() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [entryVehicle, setEntryVehicle] = useState<boolean>(false)
  const [exitVehicle, setExitVehicle] = useState<boolean>(false)
  const [entryImage, setEntryImage] = useState<string | null>(null)
  const [exitImage, setExitImage] = useState<string | null>(null)
  const [showEntryModal, setShowEntryModal] = useState<boolean>(false)
  const [showExitModal, setShowExitModal] = useState<boolean>(false)
  const [licensePlate, setLicensePlate] = useState<string>("")
  const [vehicleType, setVehicleType] = useState<"government" | "private" | "public">("private")
  const [processingImage, setProcessingImage] = useState<boolean>(false)

  const entryInputRef = useRef<HTMLInputElement>(null)
  const exitInputRef = useRef<HTMLInputElement>(null)
  const controlsRef = useRef(null)
  const { parkingData, allocateParking } = useParkingContext()

  const handleEntryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProcessingImage(true)

      // Create a URL for the image
      const imageUrl = URL.createObjectURL(file)
      setEntryImage(imageUrl)

      // Simulate AI processing
      setTimeout(() => {
        // Generate a random license plate
        const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
        const numbers = "0123456789"
        const randomLicensePlate =
          letters.charAt(Math.floor(Math.random() * letters.length)) +
          letters.charAt(Math.floor(Math.random() * letters.length)) +
          letters.charAt(Math.floor(Math.random() * letters.length)) +
          " " +
          numbers.charAt(Math.floor(Math.random() * numbers.length)) +
          numbers.charAt(Math.floor(Math.random() * numbers.length)) +
          numbers.charAt(Math.floor(Math.random() * numbers.length))

        setLicensePlate(randomLicensePlate)

        // Randomly determine vehicle type
        const types: ["government", "private", "public"] = ["government", "private", "public"]
        setVehicleType(types[Math.floor(Math.random() * types.length)])

        setProcessingImage(false)
        setShowEntryModal(true)
      }, 1500)
    }
  }

  const handleExitImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProcessingImage(true)

      // Create a URL for the image
      const imageUrl = URL.createObjectURL(file)
      setExitImage(imageUrl)

      // Simulate AI processing
      setTimeout(() => {
        // Find a random occupied spot
        const occupiedSpots = parkingData.spots.filter((spot) => spot.isOccupied)
        if (occupiedSpots.length > 0) {
          const randomSpot = occupiedSpots[Math.floor(Math.random() * occupiedSpots.length)]
          setLicensePlate(randomSpot.licensePlate)
          setVehicleType(randomSpot.vehicleType)
        } else {
          // Fallback if no occupied spots
          setLicensePlate("ABC 123")
          setVehicleType("private")
        }

        setProcessingImage(false)
        setShowExitModal(true)
      }, 1500)
    }
  }

  const confirmEntry = () => {
    // Calculate expected departure time (2 hours from now)
    const now = new Date()
    const departureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const arrivalTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const expectedDeparture = `${departureTime.getHours().toString().padStart(2, "0")}:${departureTime.getMinutes().toString().padStart(2, "0")}`

    // Allocate parking
    allocateParking({
      licensePlate,
      vehicleType,
      arrivalTime,
      expectedDeparture,
      stayDuration: 2,
    })

    // Show the vehicle in the 3D view
    setEntryVehicle(true)
    setTimeout(() => setEntryVehicle(false), 5000)

    // Close the modal
    setShowEntryModal(false)
  }

  const confirmExit = () => {
    // Show the vehicle in the 3D view
    setExitVehicle(true)
    setTimeout(() => setExitVehicle(false), 5000)

    // Close the modal
    setShowExitModal(false)
  }

  return (
    <div className="relative w-full h-[80vh]">
      {selectedFloor !== null && (
        <div className="absolute top-0 right-0 z-10 p-4 bg-white/90 rounded-bl-lg shadow-md">
          <button
            onClick={() => setSelectedFloor(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Close</span>×
          </button>
          <ParkingFloorDetails floorNumber={selectedFloor} />
        </div>
      )}

      <div className="absolute top-4 left-4 z-10 bg-white/90 p-3 rounded-lg shadow-md">
        <h3 className="font-medium text-sm mb-2">Vehicle Simulation</h3>
        <div className="space-y-2">
          <Button
            onClick={() => entryInputRef.current?.click()}
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            size="sm"
            disabled={processingImage}
          >
            {processingImage ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Entry Image
          </Button>
          <input
            type="file"
            ref={entryInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleEntryImageUpload}
          />

          <Button
            onClick={() => exitInputRef.current?.click()}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            size="sm"
            disabled={processingImage}
          >
            {processingImage ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Exit Image
          </Button>
          <input type="file" ref={exitInputRef} className="hidden" accept="image/*" onChange={handleExitImageUpload} />
        </div>
      </div>

      <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <ParkingBuilding
            floors={4}
            onFloorSelect={setSelectedFloor}
            parkingData={parkingData}
            entryVehicle={entryVehicle}
            exitVehicle={exitVehicle}
            entryImage={entryImage}
            exitImage={exitImage}
          />
          <OrbitControls
            ref={controlsRef}
            minDistance={10}
            maxDistance={50}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-4 left-4 z-10 bg-white/90 p-3 rounded-lg shadow-md">
        <h3 className="font-medium text-sm mb-2">AI Vehicle Processing</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Entry: License plate scanning & allocation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Exit: Departure processing & billing</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            AI analyzes vehicle type, expected duration, and current occupancy to allocate optimal parking spots
          </div>
        </div>
      </div>

      {/* Entry Confirmation Modal */}
      <Dialog open={showEntryModal} onOpenChange={setShowEntryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vehicle Entry Detection</DialogTitle>
            <DialogDescription>The AI system has detected the following vehicle at the entrance.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="col-span-1">
                {entryImage && (
                  <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                    <img src={entryImage || "/placeholder.svg"} alt="Vehicle" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="col-span-3 space-y-2">
                <div>
                  <Label htmlFor="license-plate" className="text-sm font-medium">
                    Detected License Plate
                  </Label>
                  <div className="flex items-center mt-1">
                    <div className="bg-blue-100 border border-blue-300 rounded px-3 py-1 font-mono font-bold text-blue-800">
                      {licensePlate}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-7 w-7 p-0"
                      onClick={() => setShowEntryModal(false)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Detected Vehicle Type</Label>
                  <div className="mt-1">
                    <RadioGroup defaultValue={vehicleType} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="government"
                          id="government"
                          checked={vehicleType === "government"}
                          readOnly
                        />
                        <Label htmlFor="government">Government</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" checked={vehicleType === "private"} readOnly />
                        <Label htmlFor="private">Private</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" checked={vehicleType === "public"} readOnly />
                        <Label htmlFor="public">Public</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowEntryModal(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmEntry} className="bg-green-600 hover:bg-green-700">
              Confirm & Allocate Parking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Modal */}
      <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vehicle Exit Detection</DialogTitle>
            <DialogDescription>The AI system has detected the following vehicle at the exit.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="col-span-1">
                {exitImage && (
                  <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                    <img src={exitImage || "/placeholder.svg"} alt="Vehicle" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="col-span-3 space-y-2">
                <div>
                  <Label htmlFor="license-plate" className="text-sm font-medium">
                    Detected License Plate
                  </Label>
                  <div className="flex items-center mt-1">
                    <div className="bg-blue-100 border border-blue-300 rounded px-3 py-1 font-mono font-bold text-blue-800">
                      {licensePlate}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Parking Information</Label>
                  <div className="mt-1 text-sm">
                    <p>Duration: 2h 15m</p>
                    <p>Amount Due: $10.50</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowExitModal(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmExit} className="bg-red-600 hover:bg-red-700">
              Confirm Payment & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

