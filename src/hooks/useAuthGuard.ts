import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'

export function useAuthGuard() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch('/api/auth/check', {
                    credentials: 'include',
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.authenticated) {
                        setIsAuthenticated(true)
                    } else {
                        setIsAuthenticated(false)
                        router.navigate({ to: '/login', search: { redirect: undefined } })
                    }
                } else {
                    setIsAuthenticated(false)
                    router.navigate({ to: '/login', search: { redirect: undefined } })
                }
            } catch (error) {
                console.error('Auth check failed:', error)
                setIsAuthenticated(false)
                router.navigate({ to: '/login', search: { redirect: undefined } })
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router])

    return { isAuthenticated, isLoading }
}
