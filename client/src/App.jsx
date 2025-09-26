import React, { useEffect } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {createRoot} from "react-dom/client";
import Navbar from "./sections/Navbar.jsx";
import Hero from "./sections/Hero.jsx";
import About from "./sections/About.jsx";
import Projects from "./sections/Projects.jsx";
import Footer from "./sections/Footer.jsx";
import Marketplace from "./sections/Marketplace.jsx";
import {DotPattern} from "./components/DotPattern.jsx";

// Home page component
const HomePage = () => {
    return (
        <>
            <section id="home" className="scroll-mt-20">
                <Hero />
            </section>
            <section id="about" className="scroll-mt-20">
                <About />
            </section>
            <section id="work" className="scroll-mt-20">
                <Projects />
            </section>
            <section id="connect" className="scroll-mt-20">
                <Footer />
            </section>
        </>
    );
};

// Dummy Project page component
const ProjectPage = () => {
    return (
        <div className="py-24">
            <h1 className="text-4xl font-bold mb-4">Project Page</h1>
            <p className="text-lg text-neutral-400">This is a placeholder for the project page.</p>
        </div>
    );
};

// Layout wrapper component
const Layout = ({ children }) => {
    return (
        <div className="relative overflow-y-hidden">
            <DotPattern className="absolute inset-0 w-full"/>
            <div className="relative container mx-auto max-w-7xl">
                <Navbar />
                {children}
            </div>
        </div>
    );
};

export const App = () => {
    const { setAuth } = useAuth();
    
    useEffect(() => {
        // Handle OAuth callback: #accessToken=...&user=BASE64_JSON
        if (typeof window !== 'undefined' && window.location.hash.startsWith('#')) {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('accessToken');
            const encodedUser = params.get('user');
            if (accessToken && encodedUser) {
                try {
                    const userJson = atob(decodeURIComponent(encodedUser));
                    const user = JSON.parse(userJson);
                    setAuth({ accessToken, user });
                } catch (e) {
                    console.error('Failed to parse OAuth callback data', e);
                } finally {
                    // Clean URL hash
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            }
        }
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/project" element={<Layout><ProjectPage /></Layout>} />
                <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
            </Routes>
        </BrowserRouter>
    )
}
export default App