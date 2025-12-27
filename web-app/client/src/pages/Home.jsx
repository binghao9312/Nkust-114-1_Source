
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Car, MapPin } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-6">
            <div className="max-w-2xl w-full text-center space-y-12">

                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-3 mb-4">
                        <MapPin className="text-blue-600" size={48} />
                        Traffic Analytics System
                    </h1>
                    <p className="text-xl text-gray-500">Select a mode to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => navigate('/analytics')}
                        className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center gap-4 text-left hover:-translate-y-1"
                    >
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <BarChart3 size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">Analytics Dashboard</h3>
                            <p className="text-gray-500 mt-2 text-sm">View statistical data, speed camera density, and filter by city.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/simulation')}
                        className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col items-center gap-4 text-left hover:-translate-y-1"
                    >
                        <div className="p-4 bg-green-50 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Car size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600">Driving Simulation</h3>
                            <p className="text-gray-500 mt-2 text-sm">Simulate movement using WASD keys and receive proximity alerts.</p>
                        </div>
                    </button>
                </div>

                <footer className="text-sm text-gray-400">
                    &copy; 2025 Speed Camera Analytics. All rights reserved.
                </footer>
            </div>
        </div>
    );
};

export default Home;
