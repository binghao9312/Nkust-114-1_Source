
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PlusCircle, MapPin, ArrowLeft } from 'lucide-react'
import AddDataForm from '../components/AddDataForm'

function Analytics() {
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [speedLimitFilter, setSpeedLimitFilter] = useState('All')
    const [showAddForm, setShowAddForm] = useState(false)

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await axios.get('http://localhost:3000/points')
            setData(response.data)
        } catch (error) {
            console.error("Error fetching data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const uniqueSpeedLimits = useMemo(() => {
        const limits = new Set(data.map(item => item.limit).filter(Boolean))
        // sort numerically
        return Array.from(limits).sort((a, b) => parseInt(a) - parseInt(b))
    }, [data])

    const chartData = useMemo(() => {
        let filtered = data
        if (speedLimitFilter !== 'All') {
            filtered = data.filter(item => item.limit == speedLimitFilter)
        }

        const cityCounts = filtered.reduce((acc, item) => {
            const city = item.CityName || 'Unknown'
            acc[city] = (acc[city] || 0) + 1
            return acc
        }, {})

        return Object.entries(cityCounts)
            .map(([City, Count]) => ({ City, Count }))
            .sort((a, b) => b.Count - a.Count)
            .slice(0, 20) // Top 20
    }, [data, speedLimitFilter])

    const totalCount = useMemo(() => {
        if (speedLimitFilter === 'All') return data.length;
        return data.filter(item => item.limit == speedLimitFilter).length;
    }, [data, speedLimitFilter]);

    if (loading && data.length === 0) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading data...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                                <MapPin className="text-blue-600" size={32} />
                                Speed Camera Analytics
                            </h1>
                            <p className="text-gray-500 mt-1">Visualize and manage traffic enforcement points across Taiwan</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <PlusCircle size={20} />
                        Add New Data
                    </button>
                </header>

                {/* Stats & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Cameras</span>
                        <span className="text-4xl font-bold text-gray-900 mt-2">{totalCount}</span>
                        <div className="text-sm text-green-600 mt-2 font-medium">
                            {speedLimitFilter === 'All' ? 'Across all limits' : `Limit: ${speedLimitFilter} km/h`}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-2 flex items-center">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Speed Limit</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors"
                                value={speedLimitFilter}
                                onChange={(e) => setSpeedLimitFilter(e.target.value)}
                            >
                                <option value="All">All Speed Limits</option>
                                {uniqueSpeedLimits.map(limit => (
                                    <option key={limit} value={limit}>{limit} km/h</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Chart Window */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[600px]">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Cameras per City (Top 20)</h2>
                    <div className="h-[500px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 60,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="City"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={80}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="Count"
                                    name="Camera Count"
                                    fill="#2563EB"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {showAddForm && (
                <AddDataForm
                    onClose={() => setShowAddForm(false)}
                    onDataAdded={fetchData}
                />
            )}
        </div>
    )
}

export default Analytics
