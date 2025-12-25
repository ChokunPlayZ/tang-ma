import { migrateToLatest } from '../../db/migrate'

export default async (_nitroApp: any) => {
    try {
        await migrateToLatest()
    } catch (err) {
        console.error('Failed to initialize database:', err)
        // We probably don't want to crash the whole server if migration fails, 
        // but it's critical. For now, we log error. 
        // In strictly orchestrated envs, you might want to process.exit(1)
    }
}
