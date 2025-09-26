import React, { useEffect } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import {createRoot} from "react-dom/client";
import Navbar from "./sections/Navbar.jsx";
import Hero from "./sections/Hero.jsx";
import About from "./sections/About.jsx";
import Projects from "./sections/Projects.jsx";
import Footer from "./sections/Footer.jsx";
import {DotPattern} from "./components/DotPattern.jsx";

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
        <div className="relative overflow-y-hidden">
            <DotPattern className="absolute inset-0 w-full"/>
            <div className="relative container mx-auto max-w-7xl">
                <Navbar />
                <section id="home" className="scroll-mt-20">
                    <Hero />
                </section>
                <section id='about'>
                    <About />
                </section>
                <section id='projects'>
                    <Projects />
                </section>
                <Footer />
            </div>

        </div>
    )
}
export default App