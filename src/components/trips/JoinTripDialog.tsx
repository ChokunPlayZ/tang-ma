import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Check } from 'lucide-react'

type SubGroup = {
    id: number
    name: string
}

type JoinTripResult = {
    success?: boolean
    tripId?: number
    requiresSubGroupSelection?: boolean
    subGroups?: SubGroup[]
    error?: string
}

export function JoinTripDialog() {
    const router = useRouter()
    const [code, setCode] = useState('')
    const [codeError, setCOdeError] = useState('')
    const [step, setStep] = useState<'CODE' | 'SUBGROUP'>('CODE')
    const [subGroups, setSubGroups] = useState<SubGroup[]>([])
    const [selectedSubGroups, setSelectedSubGroups] = useState<number[]>([])
    const [tripId, setTripId] = useState<number | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const resetForm = () => {
        setCode('')
        setCOdeError('')
        setStep('CODE')
        setSubGroups([])
        setSelectedSubGroups([])
        setTripId(null)
    }

    const toggleSubGroup = (id: number) => {
        if (selectedSubGroups.includes(id)) {
            setSelectedSubGroups(selectedSubGroups.filter(g => g !== id))
        } else {
            setSelectedSubGroups([...selectedSubGroups, id])
        }
    }

    const handleCodeSubmit = async () => {
        setCOdeError('')

        if (!code.trim()) {
            setCOdeError('กรุณาใส่รหัสทริป')
            return
        }

        if (code.length !== 6) {
            setCOdeError('รหัสทริปต้องมี 6 ตัวอักษร')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/trips/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            })

            if (!response.ok) {
                const data = await response.json()
                setCOdeError(data.error || 'ไม่พบทริป กรุณาตรวจสอบรหัส')
                return
            }

            const result: JoinTripResult = await response.json()

            if (result.requiresSubGroupSelection && result.subGroups) {
                setSubGroups(result.subGroups)
                setTripId(result.tripId || null)
                setStep('SUBGROUP')
                return
            }

            // No subgroups, navigate directly
            setIsOpen(false)
            resetForm()
            router.invalidate()
            await router.navigate({ to: `/app/trips/${result.tripId}` as any })

        } catch (error) {
            console.error(error)
            setCOdeError('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setIsLoading(false)
        }
    }

    const handleConfirmSubGroups = async () => {
        setIsLoading(true)
        try {
            // Join each selected subgroup
            for (const subGroupId of selectedSubGroups) {
                await fetch('/api/trips/join', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, subGroupId }),
                })
            }

            setIsOpen(false)
            resetForm()
            router.invalidate()
            await router.navigate({ to: `/app/trips/${tripId}` as any })

        } catch (error) {
            console.error(error)
            alert('เกิดข้อผิดพลาด')
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetForm()
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <span className="text-lg">👋</span> เข้าร่วมทริป
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🎟️</span>
                    </div>
                    <DialogTitle className="text-xl">เข้าร่วมทริป</DialogTitle>
                </DialogHeader>

                {step === 'CODE' && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                <Label className="block mb-4 text-gray-500">กรอกรหัสทริป 6 หลัก</Label>
                                <Input
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value.toUpperCase())
                                        setCOdeError('')
                                    }}
                                    placeholder="XXXXXX"
                                    maxLength={6}
                                    className="text-center text-3xl font-mono tracking-[0.5em] uppercase border-0 bg-transparent focus-visible:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-700 p-0 h-auto"
                                    autoFocus
                                />
                            </div>
                            {codeError && (
                                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2 justify-center">
                                    <span>⚠️</span> {codeError}
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={handleCodeSubmit}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-lg"
                            disabled={isLoading || code.length !== 6}
                        >
                            {isLoading ? 'กำลังตรวจสอบ...' : 'ถัดไป'}
                        </Button>
                    </div>
                )}

                {step === 'SUBGROUP' && (
                    <div className="space-y-6">
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg text-sm text-cyan-800 dark:text-cyan-200">
                            <strong>ทริปนี้มีกลุ่มย่อย!</strong> เลือกกลุ่มที่คุณต้องการเข้าร่วม (เลือกได้มากกว่า 1)
                        </div>

                        <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {subGroups.map(sg => {
                                const isSelected = selectedSubGroups.includes(sg.id)
                                return (
                                    <button
                                        key={sg.id}
                                        onClick={() => toggleSubGroup(sg.id)}
                                        className={`
                                            flex items-center justify-between p-4 rounded-xl border transition-all text-left
                                            ${isSelected
                                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }
                                        `}
                                    >
                                        <span className="font-medium">{sg.name}</span>
                                        {isSelected && (
                                            <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsOpen(false)
                                    resetForm()
                                    router.invalidate()
                                    router.navigate({ to: `/app/trips/${tripId}` as any })
                                }}
                                className="flex-1 text-gray-500"
                            >
                                ข้ามไปก่อน
                            </Button>
                            <Button
                                onClick={handleConfirmSubGroups}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                                disabled={isLoading}
                            >
                                {isLoading ? 'กำลังบันทึก...' : 'ยืนยัน'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

