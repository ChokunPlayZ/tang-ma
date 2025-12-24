import { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Share2, Copy, Check, QrCode } from 'lucide-react'
import QRCode from 'qrcode'

type ShareTripDialogProps = {
    tripCode: string
    tripName: string
}

export function ShareTripDialog({ tripCode, tripName }: ShareTripDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/join/${tripCode}`
        : `/join/${tripCode}`

    const handleOpen = async (open: boolean) => {
        setIsOpen(open)
        if (open && !qrDataUrl) {
            try {
                const url = await QRCode.toDataURL(shareUrl, {
                    width: 256,
                    margin: 2,
                    color: {
                        dark: '#0891b2', // cyan-600
                        light: '#ffffff'
                    }
                })
                setQrDataUrl(url)
            } catch (error) {
                console.error('Failed to generate QR:', error)
            }
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `ร่วมทริป: ${tripName}`,
                    text: `เข้าร่วมทริป "${tripName}" กับฉัน!`,
                    url: shareUrl,
                })
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Share failed:', error)
                }
            }
        } else {
            handleCopy()
        }
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpen(true)}
                className="gap-1"
            >
                <Share2 size={14} />
                แชร์
            </Button>

            <Dialog open={isOpen} onOpenChange={handleOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <QrCode size={20} />
                            แชร์ทริป
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Trip Info */}
                        <div className="text-center">
                            <div className="text-lg font-medium">{tripName}</div>
                            <div className="text-sm text-gray-500">รหัสทริป: <span className="font-mono font-bold">{tripCode}</span></div>
                        </div>

                        {/* QR Code */}
                        {qrDataUrl && (
                            <div className="flex justify-center">
                                <img
                                    src={qrDataUrl}
                                    alt="QR Code"
                                    className="rounded-xl border-4 border-gray-100 dark:border-gray-700"
                                />
                            </div>
                        )}

                        {/* Share Link */}
                        <div className="space-y-2">
                            <div className="text-xs text-gray-500">ลิงก์เข้าร่วม:</div>
                            <div className="flex gap-2">
                                <Input
                                    value={shareUrl}
                                    readOnly
                                    className="text-sm font-mono"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopy}
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </Button>
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCopy}
                                variant="outline"
                                className="flex-1 gap-2"
                            >
                                <Copy size={16} />
                                คัดลอกลิงก์
                            </Button>
                            <Button
                                onClick={handleShare}
                                className="flex-1 gap-2 bg-cyan-600"
                            >
                                <Share2 size={16} />
                                แชร์
                            </Button>
                        </div>

                        <p className="text-xs text-center text-gray-500">
                            ให้เพื่อนสแกน QR หรือเปิดลิงก์เพื่อเข้าร่วมทริป
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
