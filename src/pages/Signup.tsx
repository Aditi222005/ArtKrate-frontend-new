import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Palette, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { toast } from "sonner";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [countriesList, setCountriesList] = useState([
    "India", "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "Japan", "Brazil", "Mexico", "Italy", "Spain",
  ]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    gender: "",
    address: "",
    country: "",
    phoneno: "",
    profilePhoto: null as File | null,
  });

  const navigate = useNavigate();

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          if (res.data && res.data.address) {
            const addr = res.data.address;
            const road = addr.road || addr.suburb || addr.neighbourhood || "";
            const city = addr.city || addr.town || addr.village || addr.county || "";
            const state = addr.state || "";
            const postcode = addr.postcode || "";
            const countryName = addr.country || "";

            const addressParts = [road, city, state, postcode].filter(Boolean);
            const formattedAddress = addressParts.join(", ") || res.data.display_name || "";

            const normalizedCountry = countryName.toLowerCase().replace(/\s+/g, '-');
            
            const isCountryInList = countriesList.some(
              (c) => c.toLowerCase() === countryName.toLowerCase()
            );
            if (countryName && !isCountryInList) {
              setCountriesList((prev) => [...prev, countryName]);
            }

            setFormData((prev) => ({
              ...prev,
              address: formattedAddress,
              country: normalizedCountry,
            }));

            toast.success("Location detected successfully!");
          } else {
            toast.error("Could not resolve address details.");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.error("Failed to fetch location details.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        toast.error("Failed to retrieve location coordinates. Please allow permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    setIsLoading(true);
    try {
      const formPayload = new FormData();
      for (const key in formData) {
        if (formData[key as keyof typeof formData] !== undefined && formData[key as keyof typeof formData] !== null) {
          formPayload.append(key, formData[key as keyof typeof formData] as string | Blob);
        }
      }
      await axios.post("/api/signup", formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Account created! Welcome to ArtKrate.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  const SelectField = ({
    label, name, options, placeholder,
  }: { label: string; name: string; options: { value: string; label: string }[]; placeholder: string }) => (
    <div>
      <label className="block text-cream-muted text-sm font-medium mb-1.5">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={(formData as any)[name]}
          onChange={(e) => handleSelectChange(name, e.target.value)}
          className="input-dark appearance-none pr-10 cursor-pointer"
          required
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value} className="bg-surface-raised text-cream">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas overflow-hidden">
      <Navbar />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/4 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-terra/4 blur-[120px]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-2xl animate-fade-slide-up">
          {/* Card */}
          <div className="bg-surface border border-surface-border rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-ochre flex items-center justify-center mb-4 shadow-lg">
                <Palette className="w-7 h-7 text-canvas" />
              </div>
              <h1 className="font-display text-cream text-2xl font-bold">Join ArtKrate</h1>
              <p className="text-cream-subtle text-sm mt-1">Create your account and start your artistic journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-cream-muted text-sm font-medium mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                    <input
                      id="name" name="name" type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-dark pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-cream-muted text-sm font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                    <input
                      id="email" name="email" type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-dark pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Password + Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-cream-muted text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                    <input
                      id="password" name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="input-dark pl-10 pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-subtle hover:text-cream-muted transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-cream-muted text-sm font-medium mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                    <input
                      id="confirmPassword" name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="input-dark pl-10 pr-10"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-subtle hover:text-cream-muted transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: User Type + Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="I am a" name="userType" placeholder="Select role"
                  options={[{ value: "buyer", label: "Buyer / Collector" }, { value: "seller", label: "Artist / Seller" }]} />
                <SelectField label="Gender" name="gender" placeholder="Select gender"
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                    { value: "prefer-not-to-say", label: "Prefer not to say" },
                  ]} />
              </div>

              {/* Row 4: Phone + Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phoneno" className="block text-cream-muted text-sm font-medium mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                    <input
                      id="phoneno" name="phoneno" type="tel"
                      placeholder="+91 99999 00000"
                      value={formData.phoneno}
                      onChange={handleInputChange}
                      required
                      className="input-dark pl-10"
                    />
                  </div>
                </div>
                <SelectField label="Country" name="country" placeholder="Select country"
                  options={countriesList.map(c => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c }))} />
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="address" className="block text-cream-muted text-sm font-medium">Address</label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="text-xs text-gold hover:text-gold-hover flex items-center gap-1 font-medium transition-colors disabled:opacity-50"
                  >
                    {isDetectingLocation ? (
                      <>
                        <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5" />
                        Detect Location
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                  <input
                    id="address" name="address" type="text"
                    placeholder="Your full address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="input-dark pl-10"
                  />
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <label className="block text-cream-muted text-sm font-medium mb-1.5">Profile Photo</label>
                <div className="relative">
                  <input
                    id="profilePhoto" name="profilePhoto" type="file" accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, profilePhoto: e.target.files?.[0] ?? null }))}
                    className="w-full text-cream-muted text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gold/10 file:text-gold hover:file:bg-gold/20 file:cursor-pointer cursor-pointer bg-surface-raised border border-surface-border rounded-lg px-3 py-2.5 transition-all focus:outline-none focus:border-gold/50"
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input id="terms" type="checkbox" required
                  className="mt-0.5 rounded border-surface-border bg-surface-raised accent-gold w-4 h-4 flex-shrink-0" />
                <label htmlFor="terms" className="text-sm text-cream-subtle leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-gold hover:text-gold-hover transition-colors">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-gold hover:text-gold-hover transition-colors">Privacy Policy</Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-terra w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <p className="text-center text-cream-subtle text-sm mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-gold hover:text-gold-hover font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
