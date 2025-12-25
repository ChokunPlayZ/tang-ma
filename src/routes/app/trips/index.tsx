import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

import { Card, CardContent } from '../../../components/ui/card'
import { Plus, Users } from 'lucide-react'
import { JoinTripDialog } from '../../../components/trips/JoinTripDialog'
import { CreateTripDialog } from '../../../components/trips/CreateTripDialog'
import { AppNavbar } from '../../../components/AppNavbar'

type Trip = {
    id: number
    name: string
    code: string
    createdAt: string | null
    memberCount: number
}

export const Route = createFileRoute('/app/trips/')({
    component: TripsIndexPage,
})

function TripsIndexPage() {
    const router = useRouter()
    const [myTrips, setMyTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadTrips() {
            try {
                const response = await fetch('/api/trips', {
                    credentials: 'include',
                })

                if (!response.ok) {
                    router.navigate({ to: '/login', search: { redirect: undefined } })
                    return
                }

                const trips = await response.json()
                setMyTrips(trips)
            } catch (error) {
                console.error('Failed to load trips:', error)
            } finally {
                setLoading(false)
            }
        }

        loadTrips()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">กำลังโหลด...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <AppNavbar />
            <div className="p-4 max-w-2xl mx-auto space-y-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400">
                            ทริปของฉัน
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">จัดการทริปและค่าใช้จ่ายของคุณ</p>
                    </div>
                    <div className="flex gap-2">
                        <JoinTripDialog />
                        <CreateTripDialog />
                    </div>
                </div>

                {myTrips.length === 0 ? (
                    <Card className="border-dashed border-2 border-gray-200 dark:border-gray-800 bg-transparent shadow-none py-12">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Plus size={32} className="text-gray-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900 dark:text-gray-100">ยังไม่มีทริป</p>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                    เริ่มต้นด้วยการสร้างทริปใหม่ หรือใส่รหัสเพื่อเข้าร่วมทริปของเพื่อน
                                </p>
                            </div>
                            <div className="mt-4">
                                <CreateTripDialog />
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {myTrips.map(trip => (
                            <Link key={trip.id} to={`/app/trips/${trip.id}` as any} className="block group">
                                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-cyan-500 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                {trip.name}
                                            </h3>
                                            <span className="text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-full font-mono">
                                                #{trip.code}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-6">
                                            <div className="flex items-center gap-1.5">
                                                <Users size={16} className="text-gray-400" />
                                                <span>{trip.memberCount} สมาชิก</span>
                                            </div>
                                            <div className="text-xs opacity-70">
                                                สร้างเมื่อ {new Date(trip.createdAt!).toLocaleDateString('th-TH', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
