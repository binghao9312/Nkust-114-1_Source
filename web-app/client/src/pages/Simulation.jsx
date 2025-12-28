
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, AlertTriangle, MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons by deleting default and merging options
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

const MapUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([position.lat, position.lon], map.getZoom(), { animate: false });
    }, [position, map]);
    return null;
};

// Helper: Calculate destination point given distance and bearing
const toRad = deg => deg * Math.PI / 180;
const toDeg = rad => rad * 180 / Math.PI;

const getDestination = (lat, lon, dist, bearing) => {
    const R = 6371e3; // Earth Radius meters
    const δ = dist / R;
    const θ = toRad(bearing);
    const φ1 = toRad(lat);
    const λ1 = toRad(lon);

    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
    const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

    return { lat: toDeg(φ2), lon: toDeg(λ2) };
};

const DetectionCone = ({ position, heading, range, angle }) => {
    // Calculate cone points
    // Center is position
    // Point 1: heading - angle
    // Point 2: heading + angle
    // We can add intermediate points for a smooth arc if we want, but triangle is faster implies "Cone".
    // 60 degrees is wide, maybe 5 points for arc?

    const points = [];
    points.push([position.lat, position.lon]); // Center

    const startAngle = heading - angle;
    const endAngle = heading + angle;
    const step = 6; // Every 6 degrees (10 steps for 60)

    for (let b = startAngle; b <= endAngle; b += step) {
        const p = getDestination(position.lat, position.lon, range, b);
        points.push([p.lat, p.lon]);
    }

    // Ensure last point is exactly endAngle
    const pEnd = getDestination(position.lat, position.lon, range, endAngle);
    points.push([pEnd.lat, pEnd.lon]);

    // Close the loop (Leaflet Polygon auto closes, but order matters)
    // Center -> Left -> ... -> Right -> Center

    return (
        <Polygon
            positions={points}
            pathOptions={{
                color: '#3b82f6',
                weight: 1,
                fillOpacity: 0.3, // 30% match request
                fillColor: '#3b82f6'
            }}
        />
    );
};

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const Simulation = () => {
    const navigate = useNavigate();
    const [cameras, setCameras] = useState([]);
    const NKUST_POS = { lat: 22.6502, lon: 120.3275 };

    const [position, setPosition] = useState({ lat: 24.002083, lon: 121.599724 });
    const [heading, setHeading] = useState(0);
    const [address, setAddress] = useState("定位中...");

    // Alert State
    const [activeCamera, setActiveCamera] = useState(null);
    const [nearestAny, setNearestAny] = useState(null);
    const [alertStatus, setAlertStatus] = useState('NONE');

    const [jumpInput, setJumpInput] = useState({ lat: '', lon: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [isMoving, setIsMoving] = useState(false);

    const posRef = useRef({ lat: 24.002083, lon: 121.599724 });
    const headRef = useRef(0);
    const keysPressed = useRef({});

    const debouncedPosition = useDebounce(position, 1000);

    const CarIcon = L.divIcon({
        className: 'car-icon-container',
        html: `<div style="transform: rotate(${heading}deg); transition: transform 0.1s linear;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" fill="#3b82f6" fill-opacity="0.9"></circle>
                    <polygon points="12 2 19 19 12 16 5 19 12 2" fill="white"></polygon>
                </svg>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    const CameraIcon = L.divIcon({
        html: `<div class="bg-orange-500 rounded-full w-4 h-4 border-2 border-white shadow-md"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const AlertIconRed = L.divIcon({
        html: `<div class="bg-red-600 rounded-full w-6 h-6 border-2 border-white shadow-lg animate-ping"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const AlertIconGreen = L.divIcon({
        html: `<div class="bg-green-500 rounded-full w-6 h-6 border-2 border-white shadow-lg"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    useEffect(() => {
        const fetchCameras = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "points"));
                const points = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setCameras(points);
            } catch (err) {
                console.error("Error fetching cameras:", err);
            }
        };
        fetchCameras();
    }, []);

    // Physics Loop
    useEffect(() => {
        const loop = setInterval(() => {
            const w = keysPressed.current['w'];
            const s = keysPressed.current['s'];
            const a = keysPressed.current['a'];
            const d = keysPressed.current['d'];

            if (!w && !s && !a && !d) {
                setIsMoving((prev) => prev ? false : prev);
                return;
            }
            if (!isMoving) setIsMoving(true);

            if (a) headRef.current = (headRef.current - 4 + 360) % 360;
            if (d) headRef.current = (headRef.current + 4 + 360) % 360;

            if (w || s) {
                const speed = 0.00006;
                const dir = w ? 1 : -1;
                const rad = (headRef.current * Math.PI) / 180;

                const dLat = Math.cos(rad) * speed * dir;
                const dLon = Math.sin(rad) * speed * dir;

                posRef.current = {
                    lat: posRef.current.lat + dLat,
                    lon: posRef.current.lon + dLon
                };
            }

            setPosition({ ...posRef.current });
            setHeading(headRef.current);

        }, 33);

        const handleDown = (e) => keysPressed.current[e.key.toLowerCase()] = true;
        const handleUp = (e) => keysPressed.current[e.key.toLowerCase()] = false;

        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        return () => {
            clearInterval(loop);
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
        };
    }, []);

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${debouncedPosition.lat}&lon=${debouncedPosition.lon}&zoom=18&addressdetails=1&accept-language=zh-TW`;
                const res = await axios.get(url);
                if (res.data) {
                    const addr = res.data.address;
                    const road = addr.road || addr.pedestrian || addr.suburb || res.data.display_name.split(',')[0];
                    setAddress(road || "未知路段");
                }
            } catch (err) { setAddress("無法取得路名"); }
        };
        fetchAddress();
    }, [debouncedPosition]);

    const getCardinal = (deg) => {
        if (deg >= 315 || deg < 45) return '北';
        if (deg >= 45 && deg < 135) return '東';
        if (deg >= 135 && deg < 225) return '南';
        return '西';
    };

    // Alert Logic
    useEffect(() => {
        if (cameras.length === 0) return;

        const R = 6371e3;
        const ALERT_RANGE = 700;
        const ANGLE_CONE = 30; // +/- 30 degrees

        let minThreatDist = Infinity;
        let bestThreat = null;

        let minAnyDist = Infinity;
        let bestAny = null;

        cameras.forEach(cam => {
            const lat = parseFloat(cam.Latitude);
            const lon = parseFloat(cam.Longitude);
            if (isNaN(lat) || isNaN(lon)) return;

            const φ1 = position.lat * Math.PI / 180;
            const φ2 = lat * Math.PI / 180;
            const Δφ = (lat - position.lat) * Math.PI / 180;
            const Δλ = (lon - position.lon) * Math.PI / 180;
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = R * c;

            if (dist > 2000) return;

            // Bearing Calc
            const y = Math.sin(Δλ) * Math.cos(φ2);
            const x = Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
            let bearing = Math.atan2(y, x) * 180 / Math.PI;
            bearing = (bearing + 360) % 360;

            let relAngle = bearing - heading;
            while (relAngle <= -180) relAngle += 360;
            while (relAngle > 180) relAngle -= 360;

            const inCone = Math.abs(relAngle) <= ANGLE_CONE;
            const inRange = dist < ALERT_RANGE;

            const camData = { ...cam, dist, relAngle, inCone };

            if (dist < minAnyDist) {
                minAnyDist = dist;
                bestAny = camData;
            }

            if (inRange && inCone) {
                if (dist < minThreatDist) {
                    minThreatDist = dist;
                    bestThreat = camData;
                }
            }
        });

        if (bestThreat) {
            const carDir = getCardinal(heading);
            const camDirectStr = bestThreat.direct || "";

            let directionMatch = true;
            if (camDirectStr.includes("雙向") || camDirectStr.includes("往返")) {
                directionMatch = true;
            } else {
                const hasN = camDirectStr.includes("北");
                const hasS = camDirectStr.includes("南");
                const hasE = camDirectStr.includes("東");
                const hasW = camDirectStr.includes("西");

                if (hasN || hasS || hasE || hasW) {
                    directionMatch = false;
                    if (hasN && carDir === '北') directionMatch = true;
                    if (hasS && carDir === '南') directionMatch = true;
                    if (hasE && carDir === '東') directionMatch = true;
                    if (hasW && carDir === '西') directionMatch = true;
                } else {
                    directionMatch = true;
                }
            }

            setAlertStatus(directionMatch ? 'RED' : 'GREEN');
            setActiveCamera(bestThreat);
        } else {
            setAlertStatus('NONE');
            setActiveCamera(bestAny);
        }

        setNearestAny(bestAny);

    }, [position, cameras, heading]);

    const handleJump = () => {
        const lat = parseFloat(jumpInput.lat);
        const lon = parseFloat(jumpInput.lon);

        if (isNaN(lat) || isNaN(lon)) {
            setErrorMsg("格式錯誤");
            return;
        }

        const isTaiwan = lat > 21.5 && lat < 26.5 && lon > 119 && lon < 123;

        if (!isTaiwan) {
            setErrorMsg("不在台灣範圍內！已跳轉至高雄科技大學。");
            posRef.current = { ...NKUST_POS };
            setPosition({ ...NKUST_POS });
        } else {
            setErrorMsg("");
            posRef.current = { lat, lon };
            setPosition({ lat, lon });
        }
    };

    const getDisplayCam = () => {
        if (alertStatus === 'RED' || alertStatus === 'GREEN') return activeCamera;
        return nearestAny;
    };

    const displayCam = getDisplayCam();

    return (
        <div className={`min-h-screen transition-colors duration-500 
            ${alertStatus === 'RED' ? 'bg-red-50' : alertStatus === 'GREEN' ? 'bg-green-50' : 'bg-gray-50'} p-8 font-sans`}>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <Navigation className="text-green-600" size={32} />
                            駕駛模擬系統 (Pro + 視覺化)
                        </h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-3 text-sm">
                            <span className="px-2 py-0.5 bg-gray-100 border rounded font-mono font-bold">W/S</span> 前進/後退
                            <span className="px-2 py-0.5 bg-gray-100 border rounded font-mono font-bold">A/D</span> 轉向
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[750px]">

                    {/* Left Panel */}
                    <div className="lg:col-span-1 space-y-4 flex flex-col">

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">當前位置</h2>
                            <div className="text-xl font-bold text-gray-900 leading-tight mb-4 min-h-[3rem]">{address}</div>

                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">車頭角度</div>
                                    <div className="text-xl font-mono text-gray-900 flex gap-2">
                                        {Math.round(heading)}°
                                        <span className="font-bold text-blue-600">({getCardinal(heading)})</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center relative shadow-sm">
                                    <div style={{ transform: `rotate(${-heading}deg)`, transition: 'transform 0.1s linear' }} className="w-full h-full flex items-center justify-center">
                                        <div className="w-1 h-3 bg-red-500 absolute top-2 rounded-full"></div>
                                        <div className="w-1 h-3 bg-gray-300 absolute bottom-2 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 flex-1 flex flex-col items-center justify-center text-center max-h-[300px]
                            ${alertStatus === 'RED' ? 'bg-red-600 border-red-700 text-white animate-pulse' :
                                alertStatus === 'GREEN' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-white border-green-100 text-gray-600'}`}>

                            {alertStatus === 'RED' && displayCam && (
                                <>
                                    <AlertTriangle size={64} className="mb-4" />
                                    <h2 className="text-3xl font-black uppercase">前方有測速照相!</h2>
                                    <p className="text-red-100 mt-2 text-xl font-mono">距離 {displayCam.dist?.toFixed(0)} 公尺</p>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <span className="bg-red-700/50 px-3 py-1 rounded text-sm text-white">
                                            拍攝方向: {displayCam.direct}
                                        </span>
                                        <span className="text-xs text-red-200">
                                            位於{displayCam.relAngle > 5 ? '右前方' : displayCam.relAngle < -5 ? '左前方' : '正前方'} {Math.abs(displayCam.relAngle)?.toFixed(0)}°
                                        </span>
                                    </div>
                                </>
                            )}

                            {alertStatus === 'GREEN' && displayCam && (
                                <>
                                    <div className="p-4 bg-green-200 text-green-700 rounded-full mb-4">
                                        <Navigation size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold">方向不同，請繼續行駛</h2>
                                    <p className="text-green-700 mt-2">
                                        您的方向: <span className="font-bold">{getCardinal(heading)}</span>
                                        <br />
                                        相機方向: <span className="font-bold">{displayCam.direct}</span>
                                    </p>
                                </>
                            )}

                            {alertStatus === 'NONE' && (
                                <>
                                    <div className="p-4 bg-green-50 text-green-600 rounded-full mb-4">
                                        <Navigation size={40} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">路況良好</h2>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {displayCam ? `最近點: ${displayCam.Address.slice(0, 6)}... (${displayCam.dist?.toFixed(0)}m)` : '附近無測速照相'}
                                    </p>
                                    {displayCam && (
                                        <p className="text-xs text-gray-300 mt-1">
                                            (方位 {displayCam.relAngle?.toFixed(0)}° - 非正前方)
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Search size={16} />以此經緯度跳轉
                            </h2>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <input
                                    type="number"
                                    placeholder="緯度 (Lat)"
                                    className="p-2 border rounded-lg text-sm"
                                    value={jumpInput.lat}
                                    onChange={e => setJumpInput({ ...jumpInput, lat: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="經度 (Lon)"
                                    className="p-2 border rounded-lg text-sm"
                                    value={jumpInput.lon}
                                    onChange={e => setJumpInput({ ...jumpInput, lon: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handleJump}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors"
                            >
                                開始傳送
                            </button>
                            {errorMsg && (
                                <div className="mt-3 p-3 bg-red-50 text-red-600 text-xs rounded-lg font-bold border border-red-100">
                                    {errorMsg}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-gray-100 rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative z-0">
                        <MapContainer
                            center={[position.lat, position.lon]}
                            zoom={17}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                            attributionControl={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <MapUpdater position={position} />

                            <DetectionCone
                                position={position}
                                heading={heading}
                                range={700}
                                angle={30} // +/- 30 = 60 cone
                            />

                            <Marker position={[position.lat, position.lon]} icon={CarIcon} zIndexOffset={1000} />

                            {cameras.map((c, i) => {
                                const lat = parseFloat(c.Latitude);
                                const lon = parseFloat(c.Longitude);
                                if (Math.abs(lat - position.lat) > 0.05 || Math.abs(lon - position.lon) > 0.05) return null;

                                const isAlertTarget = activeCamera && activeCamera.Address === c.Address;

                                return (
                                    <Marker
                                        key={i}
                                        position={[lat, lon]}
                                        icon={isAlertTarget && alertStatus === 'RED' ? AlertIconRed :
                                            isAlertTarget && alertStatus === 'GREEN' ? AlertIconGreen : CameraIcon}
                                    >
                                        <Popup>
                                            <div className="text-center">
                                                <div className="font-bold text-gray-900">測速照相</div>
                                                <div className="text-xs text-gray-500">{c.Address}</div>
                                                <div className="text-xs text-blue-600">{c.direct}</div>
                                                <div className="text-red-600 font-black mt-1">速限 {c.limit} km/h</div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>

                        <div className="absolute bottom-4 right-4 z-[9999] bg-white/90 backdrop-blur px-3 py-1 rounded-md text-xs font-bold shadow text-gray-600">
                            OpenStreetMap
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulation;
