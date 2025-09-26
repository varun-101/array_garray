import React from 'react'

const Marketplace = () => {
    return (
        <section className="c-space section-spacing min-h-screen">
            <h2 className="text-heading">Marketplace</h2>
            <p className="text-gray-400 text-lg mb-12 text-center">Discover premium development resources and tools</p>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12">
                {/*Grid-1 - Featured Products*/}
                <div className="flex flex-col justify-start p-6 grid-default-color grid-1">
                    <div className="z-10">
                        <p className="headtext mb-4">Featured Products</p>
                        <p className="subtext mb-6">Discover the latest and most popular items in our marketplace. From innovative tech solutions to creative tools that enhance your development workflow.</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                                <span className="text-sm text-gray-300 font-medium">Premium Code Templates</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <span className="text-sm text-gray-300 font-medium">Developer Tools</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                                <span className="text-sm text-gray-300 font-medium">Design Resources</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                                <span className="text-sm text-gray-300 font-medium">Learning Materials</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/*Grid-2 - Categories*/}
                <div className="grid-default-color grid-2">
                    <div className="flex flex-col items-center justify-center w-full h-full p-4">
                        <p className="mb-6 text-2xl font-bold text-gray-200">Browse Categories</p>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="p-4 bg-gray-800 rounded-lg text-center cursor-pointer hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl mb-2">🌐</div>
                                <p className="text-sm text-white font-semibold">Web Apps</p>
                            </div>
                            <div className="p-4 bg-gray-800 rounded-lg text-center cursor-pointer hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl mb-2">📱</div>
                                <p className="text-sm text-white font-semibold">Mobile</p>
                            </div>
                            <div className="p-4 bg-gray-800 rounded-lg text-center cursor-pointer hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl mb-2">⚡</div>
                                <p className="text-sm text-white font-semibold">APIs</p>
                            </div>
                            <div className="p-4 bg-gray-800 rounded-lg text-center cursor-pointer hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl mb-2">🛠️</div>
                                <p className="text-sm text-white font-semibold">Tools</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/*Grid-3 - Stats*/}
                <div className="grid-black-color grid-3">
                    <div className="z-10 flex flex-col justify-center h-full p-6">
                        <p className="headtext mb-6">Platform Stats</p>
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-blue-400 mb-1">500+</p>
                                <p className="subtext">Products Available</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-green-400 mb-1">1K+</p>
                                <p className="subtext">Happy Customers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-4xl font-bold text-purple-400 mb-1">50+</p>
                                <p className="subtext">Verified Sellers</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                
            
                
                
            </div>

        </section>
    )
}

export default Marketplace