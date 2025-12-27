
import { JSONFilePreset } from 'lowdb/node'

// Initialize the database with a default empty points array
const defaultData = { points: [] }
const db = await JSONFilePreset('db.json', defaultData)

export default db;
