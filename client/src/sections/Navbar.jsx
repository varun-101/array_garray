import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { motion } from "motion/react";
function Navigation() {
    return (
        <ul className="nav-ul">
            <li className="nav-li">
                <a className="nav-link" href="#home">
                    Home
                </a>
            </li>
            <li className="nav-li">
                <a className="nav-link" href="#about">
                    MarketPlace
                </a>
            </li>
            <li className="nav-li">
                <a className="nav-link" href="#work">
                    Projects
                </a>
            </li>
            <li className="nav-li">
                <a className="nav-link" href="#connect">
                    Connect
                </a>
            </li>
        </ul>
    );
}
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    return (
        <div className="fixed inset-x-0 z-20 w-full backdrop-blur-lg bg-primary/40">
            <div className="mx-auto c-space max-w-7xl">
                <div className="flex items-center justify-between py-2 sm:py-0">
                    <a
                        href="/"
                        className="text-xl font-bold transition-colors text-neutral-400 hover:text-white"
                    >
                        Engiverse
                    </a>

                    <nav className="hidden sm:flex">
                        <Navigation />
                    </nav>
                    {!user ? (
                        <a
                            href="/auth/github"
                            className="hidden sm:inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                            aria-label="Login with GitHub"
                        >
                            <img src="assets/logos/github.svg" alt="GitHub" className="h-4 w-4" />
                            <span>Login</span>
                        </a>
                    ) : (
                        <div className="hidden sm:flex items-center gap-3 text-white/90">
                            <img src={user?.avatar} alt={user?.username || 'avatar'} className="h-6 w-6 rounded-full" />
                            <span className="text-sm">{user?.name || user?.username}</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex cursor-pointer text-neutral-400 hover:text-white focus:outline-none sm:hidden"
                    >
                        <img
                            src={isOpen ? "assets/close.svg" : "assets/menu.svg"}
                            className="w-6 h-6"
                            alt="toggle"
                        />
                    </button>
                </div>
            </div>
            {isOpen && (
                <motion.div
                    className="block overflow-hidden text-center sm:hidden"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ maxHeight: "100vh" }}
                    transition={{ duration: 1 }}
                >
                    <nav className="pb-5">
                        <Navigation />
                        {!user ? (
                            <div className="mt-4 flex w-full justify-center">
                                <a
                                    href="/auth/github"
                                    className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                                    aria-label="Login with GitHub"
                                >
                                    <img src="assets/logos/github.svg" alt="GitHub" className="h-4 w-4" />
                                    <span>Login with GitHub</span>
                                </a>
                            </div>
                        ) : (
                            <div className="mt-4 flex w-full items-center justify-center gap-3 text-white/90">
                                <img src={user?.avatar} alt={user?.username || 'avatar'} className="h-6 w-6 rounded-full" />
                                <span className="text-sm">{user?.name || user?.username}</span>
                            </div>
                        )}
                    </nav>
                </motion.div>
            )}
        </div>
    );
};

export default Navbar;