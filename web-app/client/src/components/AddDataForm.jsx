
import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const AddDataForm = ({ onClose, onDataAdded }) => {
    const [formData, setFormData] = useState({
        CityName: '',
        RegionName: '',
        Address: '',
        DeptNm: '',
        BranchNm: '',
        Longitude: '',
        Latitude: '',
        direct: '',
        limit: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.CityName || !formData.limit) {
            alert("CityName and Speed Limit are required!");
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:3000/points', formData);
            onDataAdded();
            onClose();
        } catch (error) {
            console.error("Error adding data", error);
            alert("Failed to add data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">New Speed Camera</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City Name *</label>
                            <input name="CityName" value={formData.CityName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. Taipei City" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Speed Limit *</label>
                            <input name="limit" value={formData.limit} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. 50" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Region Name</label>
                        <input name="RegionName" value={formData.RegionName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input name="Address" value={formData.Address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <input name="DeptNm" value={formData.DeptNm} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Branch</label>
                            <input name="BranchNm" value={formData.BranchNm} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Longitude</label>
                            <input name="Longitude" value={formData.Longitude} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Latitude</label>
                            <input name="Latitude" value={formData.Latitude} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Direction</label>
                        <input name="direct" value={formData.direct} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDataForm;
