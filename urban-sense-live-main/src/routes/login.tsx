import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MapPin, ShieldAlert, Cpu } from "lucide-react";

export const Route = createFileRoute("/login")({
    component: LoginPage,
});

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function LoginPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const [cities, setCities] = useState<any[]>([]);
    const [detecting, setDetecting] = useState(false);

    useEffect(() => {
        // Fetch support Smart Cities from backend
        fetch("http://localhost:8000/api/v1/cities")
            .then(r => r.json())
            .then(data => setCities(data))
            .catch(e => console.error("Could not fetch remote cities", e));
    }, []);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                if (cities.length === 0) {
                    setDetecting(false);
                    return;
                }

                // Find closest city
                let closestCity = cities[0];
                let minDistance = getDistanceFromLatLonInKm(userLat, userLng, closestCity.lat, closestCity.lng);

                for (let i = 1; i < cities.length; i++) {
                    const dist = getDistanceFromLatLonInKm(userLat, userLng, cities[i].lat, cities[i].lng);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestCity = cities[i];
                    }
                }

                toast.success(`Location identified near ${closestCity.name}!`, { description: "Auto-configuring interface for local municipality." });
                const u = closestCity.id === "HYD" ? "admin" : `${closestCity.id.toLowerCase()}_admin`;
                setUsername(u);
                setPassword("admin");
                setDetecting(false);
            },
            (error) => {
                toast.error("Location Access Denied", { description: "Manually select your municipality login." });
                setDetecting(false);
            }
        );
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error("Please enter credentials");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Login failed");

            toast.success("OTP Generated", { description: data.message });
            setStep(2);
        } catch (err: any) {
            toast.error("Authentication Error", { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) {
            toast.error("Please enter OTP");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Verification failed");

            localStorage.setItem("urban_eye_token", data.access_token);

            // Fetch user profile to get primary_zone
            const profileRes = await fetch("http://localhost:8000/auth/me", {
                headers: { "Authorization": `Bearer ${data.access_token}` },
            });
            if (profileRes.ok) {
                const profile = await profileRes.json();
                localStorage.setItem("city_id", profile.city_id || "");
                localStorage.setItem("zone", profile.zone || "");
                localStorage.setItem("circle", profile.circle || "");
                localStorage.setItem("ward", profile.ward || "");
                localStorage.setItem("role", profile.role || "officer");
            }

            toast.success("Verified Securely", { description: "Welcome to Urban Eye" });
            navigate({ to: "/" });
        } catch (err: any) {
            toast.error("Verification Error", { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    // Quick Demo autofill
    const loadDemo = (id: string) => {
        setUsername(id === "HYD" ? "admin" : `${id.toLowerCase()}_admin`);
        setPassword("admin");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white text-black p-4">
            <div className="w-full max-w-[500px] border-2 border-black p-8 bg-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 flex items-center justify-center -mr-16 -mt-16 rotate-45 transform">
                    <ShieldAlert className="text-gray-300 w-10 h-10 rotate-[-45deg]" />
                </div>

                <div className="mb-6 z-10 w-full">
                    <h1 className="text-4xl font-black uppercase mb-1 tracking-tighter">Urban Eye</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">National Executive Dashboard v2.0</p>
                </div>

                {step === 1 ? (
                    <>
                        <button
                            onClick={detectLocation}
                            disabled={detecting || cities.length === 0}
                            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-black border-2 border-black font-bold uppercase tracking-widest py-3 mb-6 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            <MapPin className="w-4 h-4" />
                            {detecting ? "Triangulating Satellites..." : "Detect Regional Municipality"}
                        </button>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-800">Officer Secure ID (City Admin)</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full border-2 border-black bg-white text-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="e.g. mumbai_admin"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-800">System Passcode</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border-2 border-black bg-white text-black p-3 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-black"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 mt-2 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Cpu className="w-4 h-4" />
                                {loading ? "Authenticating Session..." : "Initialize Session"}
                            </button>
                        </form>
                    </>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-4 mt-4">
                        <div className="text-center mb-6 border-b-2 border-black pb-6">
                            <h3 className="text-xl font-black uppercase tracking-wider mb-2">Multi-Factor Gateway</h3>
                            <p className="text-xs font-semibold text-gray-600">Secure 6-digit access code dispatched</p>
                        </div>

                        <div className="space-y-1">
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full border-2 border-black bg-white text-black p-4 text-center text-3xl tracking-[0.7em] font-mono focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="------"
                            />
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 mt-4 hover:bg-gray-800 transition-colors"
                        >
                            {loading ? "Verifying Fingerprint..." : "Confirm & Enter"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black mt-2 transition-colors"
                        >
                            <span className="border-b border-gray-400 hover:border-black">Terminate Authentication</span>
                        </button>
                    </form>
                )}

                {/* Multi-City Quick Login Blocks for Judges */}
                <div className="mt-8 border-t-2 border-black pt-6">
                    <p className="text-[10px] uppercase font-bold tracking-widest mb-3 text-black flex items-center justify-between">
                        <span>Restricted Regional Instances (Demo)</span>
                        <span className="bg-black text-white px-2 py-0.5 rounded-sm">Judges</span>
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {cities.map((city) => (
                            <button
                                key={city.id}
                                onClick={(e) => { e.preventDefault(); loadDemo(city.id); }}
                                className="p-2 border-2 border-gray-200 hover:border-black text-left cursor-pointer transition-all hover:bg-gray-50 flex flex-col justify-center"
                            >
                                <span className="font-bold text-[11px] text-black block truncate">{city.name}</span>
                                <span className="text-[9px] font-mono text-gray-500 uppercase">Gateway ID: {city.id}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
