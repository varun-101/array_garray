import React from 'react'
import { ShimmerButton } from '../components/ShimmerButton.jsx';

const Footer = () => {
    return (
        <footer className="c-space py-8 mt-8">
            <div className="flex flex-col items-center justify-center gap-6">
                <h3 className="text-xl font-medium text-neutral-300">Connect with me</h3>
                
                {/* Social Media Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <a href="https://github.com/vedantbhole" target="_blank" rel="noopener noreferrer">
                        <ShimmerButton className="shadow-2xl">
                            <img src="assets/logos/github-1.svg" alt="Github" className="w-5 h-5 mr-2" />
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                                Github
                            </span>
                        </ShimmerButton>
                    </a>
                    <a href="http://www.linkedin.com/in/vedantbhole" target="_blank" rel="noopener noreferrer">
                        <ShimmerButton className="shadow-2xl">
                            <img src="assets/socials/linkedIn.svg" alt="LinkedIn" className="w-5 h-5 mr-2" />
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                                LinkedIn
                            </span>
                        </ShimmerButton>
                    </a>
                    <a href="https://leetcode.com/u/vedaantb/" target="_blank" rel="noopener noreferrer">
                        <ShimmerButton className="shadow-2xl">
                            <img src="assets/logos/leetcode.png" alt="LeetCode" className="w-5 h-5 mr-2" />
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                                Leetcode
                            </span>
                        </ShimmerButton>
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer 