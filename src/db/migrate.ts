import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db } from './index'

export async function migrateToLatest() {
    console.log('🚧 Starting database migration...')
    try {
        // checks if the "drizzle" folder exists and runs migrations
        // defaulting to "drizzle" folder in the project root
        await migrate(db, { migrationsFolder: 'drizzle' })
        console.log('✅ Database migration completed successfully.')
    } catch (error) {
        console.error('❌ Database migration failed:', error)
        throw error
    }
}
