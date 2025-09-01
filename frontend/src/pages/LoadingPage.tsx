import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Pill, Stethoscope, Users, Shield, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const LoadingPage = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentText, setCurrentText] = useState("Initializing Pharmalytics Care...");
  const navigate = useNavigate();

  const loadingTexts = [
    "Initializing Pharmalytics Care...",
    "Loading healthcare modules...",
    "Connecting to rural communities...",
    "Preparing AI diagnostics...",
    "Setting up pharmacy networks...",
    "Almost ready..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate("/app");
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const textInterval = setInterval(() => {
      setCurrentText((prev) => {
        const currentIndex = loadingTexts.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full mx-4">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
              <Heart className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Pharmalytics Care</h1>
          <p className="text-gray-600 dark:text-gray-300">Rural Healthcare Management System</p>
        </div>

        {/* Loading Animation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{loadingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm animate-fade-in">{currentText}</p>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">AI Diagnostics</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <Pill className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">Pharmacy</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">Community</p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Secure • HIPAA Compliant • AI-Powered</span>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-4 h-4 bg-blue-200 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-green-200 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-40 left-20 w-5 h-5 bg-purple-200 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-10 w-2 h-2 bg-pink-200 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
