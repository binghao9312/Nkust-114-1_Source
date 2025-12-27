
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { PlusCircle, MapPin, ArrowLeft, Search } from 'lucide-react'
import AddDataForm from '../components/AddDataForm'

const COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899'  // Pink
];

function Analytics() {
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [speedLimitFilter, setSpeedLimitFilter] = useState('All')
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

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
        return Array.from(limits).sort((a, b) => parseInt(a) - parseInt(b))
    }, [data])

    // Bar Chart Data
    const barChartData = useMemo(() => {
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
            .slice(0, 20)
    }, [data, speedLimitFilter])

    // Pie Chart Data (City Distribution based on Filter)
    const pieChartData = useMemo(() => {
        let filtered = data
        if (speedLimitFilter !== 'All') {
            filtered = data.filter(item => item.limit == speedLimitFilter)
        }

        const counts = filtered.reduce((acc, item) => {
            const city = item.CityName || 'Unknown'
            acc[city] = (acc[city] || 0) + 1
            return acc
        }, {})

        // Transform to array and sort
        const sorted = Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

        // Optimization: If too many cities, group small ones into "Others" (Optional, but good for Pie)
        // For now, let's just show Top 8 to match colors, rest as "其他"
        if (sorted.length > 8) {
            const top8 = sorted.slice(0, 8);
            const othersCount = sorted.slice(8).reduce((sum, item) => sum + item.value, 0);
            return [...top8, { name: '其他縣市', value: othersCount }];
        }

        return sorted;
    }, [data, speedLimitFilter])

    // Table Data (Filtered)
    const tableData = useMemo(() => {
        return data.filter(item => {
            const matchLimit = speedLimitFilter === 'All' || item.limit == speedLimitFilter
            const search = searchTerm.toLowerCase()
            const matchSearch = searchTerm === '' ||
                (item.CityName?.toLowerCase().includes(search)) ||
                (item.Address?.toLowerCase().includes(search))
            return matchLimit && matchSearch
        })
    }, [data, speedLimitFilter, searchTerm])

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
                                測速照相數據分析
                            </h1>
                            <p className="text-gray-500 mt-1">視覺化與管理全台交通執法點位</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <PlusCircle size={20} />
                        新增資料
                    </button>
                </header>

                {/* Stats & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">總相機數</span>
                        <span className="text-4xl font-bold text-gray-900 mt-2">{totalCount}</span>
                        <div className="text-sm text-green-600 mt-2 font-medium">
                            {speedLimitFilter === 'All' ? '所有速限' : `速限: ${speedLimitFilter} km/h`}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-2 flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">速限篩選</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors"
                                value={speedLimitFilter}
                                onChange={(e) => setSpeedLimitFilter(e.target.value)}
                            >
                                <option value="All">所有速限</option>
                                {uniqueSpeedLimits.map(limit => (
                                    <option key={limit} value={limit}>{limit} km/h</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">搜尋地址/城市</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="輸入關鍵字..."
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pl-10"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                    {/* Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">各縣市設置數量 (Top 20)</h2>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={barChartData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
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
                                    <Bar dataKey="Count" name="數量" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">各縣市佔比 ({speedLimitFilter === 'All' ? '全速限' : `${speedLimitFilter} km/h`})</h2>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={150}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">詳細資料列表 ({tableData.length} 筆)</h2>
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
                                <tr>
                                    <th className="px-6 py-4 font-bold">縣市</th>
                                    <th className="px-6 py-4 font-bold">地區</th>
                                    <th className="px-6 py-4 font-bold">地址/位置</th>
                                    <th className="px-6 py-4 font-bold">拍攝方向</th>
                                    <th className="px-6 py-4 font-bold">速限</th>
                                    <th className="px-6 py-4 font-bold">管轄單位</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.CityName}</td>
                                        <td className="px-6 py-4">{item.RegionName}</td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={item.Address}>{item.Address}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">
                                                {item.direct}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-gray-900">{item.limit} km/h</td>
                                        <td className="px-6 py-4 text-xs text-gray-400">{item.DeptNm} {item.BranchNm}</td>
                                    </tr>
                                ))}
                                {tableData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            查無資料
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
