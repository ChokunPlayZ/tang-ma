import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Plus } from 'lucide-react'

export function CreateTripDialog() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsLoading(true)
        try {
            const response = await fetch('/api/trips/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })

            if (!response.ok) {
                throw new Error('Failed to create trip')
            }

            const trip = await response.json()
            setIsOpen(false)
            setName('')
            router.invalidate()
            await router.navigate({ to: `/app/trips/${trip.id}` as any })
        } catch (error) {
            console.error(error)
            alert("Failed to create trip")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-linear-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-md gap-2" size="default">
                    <Plus size={18} /> สร้างทริป
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">✈️</span>
                    </div>
                    <DialogTitle className="text-xl">สร้างทริปใหม่</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-500">ชื่อทริป (Trip Name)</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="เช่น ไปเที่ยวเชียงใหม่ ⛰️"
                            required
                            className="text-lg py-6"
                            autoFocus
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-lg"
                        disabled={isLoading || !name.trim()}
                    >
                        {isLoading ? 'กำลังสร้าง...' : 'สร้างทริป'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
