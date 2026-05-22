import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import heroImage from '../images/1.png'
import arImage from '../images/2.png'

export default function Landingpage() {
  // ✅ Points directly to the public folder asset to fix the Vite build error
  const tour360 = "/images/360_1.insp"; 

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-700 rounded text-white flex items-center justify-center text-xs font-bold">📋</div>
            <span className="text-xl font-bold text-green-700">MyTalipapa</span>
          </div>
          <div className="hidden sm:flex gap-4 items-center">
            <Link to="/login" className="text-gray-700 hover:text-green-700 font-medium transition">Login</Link>
            <button className="bg-green-700 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-800 transition">
              Get Started
            </button>
          </div>
          <button className="sm:hidden bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-800">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
                ✓ THE MARKET MODERNIZED
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Your modern market management partner
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed">
                Streamline stall rentals, guide customers with AR, and manage your public market with the industrial reliability of a modern digital tool.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition flex items-center justify-center gap-2">
                  Get Started <ArrowRight size={20} />
                </button>
                <Link to="/login" className="border-2 border-gray-400 text-gray-800 px-8 py-3 rounded-full font-semibold hover:border-gray-600 transition text-center">
                  Login to Dashboard
                </Link>
              </div>
            </div>
            
            {/* Hero Image Area */}
            <div className="hidden lg:block relative h-96">
              <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl overflow-hidden shadow-2xl h-full w-full">
                <img src={heroImage} alt="Market" className="w-full h-full object-cover rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100 text-center">
            <div className="text-4xl sm:text-5xl font-bold text-orange-500 mb-2">120</div>
            <p className="text-gray-600 font-semibold text-sm sm:text-base">TOTAL STALLS</p>
          </div>
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100 text-center">
            <div className="text-4xl sm:text-5xl font-bold text-green-700 mb-2">• 15</div>
            <p className="text-gray-600 font-semibold text-sm sm:text-base">AVAILABLE STALLS</p>
          </div>
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100 text-center">
            <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">105</div>
            <p className="text-gray-600 font-semibold text-sm sm:text-base">OCCUPIED STALLS</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Transforming the Palengke Experience
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* AR Stall Navigation */}
            <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition bg-white">
              <div className="h-48 sm:h-56 bg-gradient-to-br from-gray-700 to-gray-900 relative overflow-hidden">
                <img src={arImage} alt="AR Navigation" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded">
                  INNOVATION
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AR Stall Navigation</h3>
                <p className="text-gray-600 mb-4">Never get lost in the market again. Real-time digital paths guiding your customers directly to their favorite vendors.</p>
                <a href="#" className="text-orange-500 font-semibold flex items-center gap-2 hover:gap-3 transition">
                  Explore Portal <ArrowRight size={18} />
                </a>
              </div>
            </div>

            {/* Easy Rental */}
            <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition bg-orange-50">
              <div className="p-6 sm:p-8 h-full flex flex-col justify-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Easy Rental</h3>
                <p className="text-gray-700 mb-4">Digital contracts, automated billing, and transparent stall availability at your fingertips.</p>
                <a href="#" className="text-orange-600 font-semibold flex items-center gap-2 hover:gap-3 transition w-fit">
                  Explore Portal <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* 360 Market Tour */}
          <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-48 sm:h-64 lg:h-72 bg-gradient-to-br from-green-700 to-green-900 relative order-2 lg:order-1 overflow-hidden">
                {/* Note: Standard <img> handles .jpg/.png preview images cleanly. 
                    If using a 360 viewer component later, swap this out for your viewer tag */}
                <img src={tour360} alt="Market 360 Tour Preview" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded">
                  VIRTUAL TOUR
                </div>
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-center order-1 lg:order-2">
                <div className="text-4xl mb-4">👁️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">360° Market Tour</h3>
                <p className="text-gray-700">A virtual window into your market. Showcase stall spaces to potential tenants without a site visit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to upgrade your market?</h2>
          <p className="text-green-100 text-lg mb-8">Join over 50 municipal markets across the country streamlining their operations with MyTalipapa.</p>
          <button className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition">
            Contact Our Sales Team
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-green-600 rounded text-white flex items-center justify-center text-xs font-bold">📋</div>
                <span className="text-white font-bold">MyTalipapa</span>
              </div>
              <p className="text-sm text-gray-400">Building the digital infrastructure for the Filipino market community since 2024.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">PRODUCT</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Stall Management</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Revenue Tracking</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Customer AR App</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Market Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">RESOURCES</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Partner Program</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">LEGAL</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Accessibility</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2024 MyTalipapa Systems Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">🌐</a>
              <a href="#" className="text-gray-400 hover:text-white transition">🔒</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}