import React, {useRef} from 'react'
import Card from "../components/Card.jsx";
import {Globe} from "../components/Globe.jsx";
import CopyEmailButton from "../components/CopyEmailButton.jsx";
import {Frameworks} from "../components/Frameworks.jsx";


const About = () => {
    const grid2Container = useRef()
    return (
        <section className="c-space section-spacing">
            <h2 className="text-heading">About Me</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12">
                {/*Grid-1*/}
                <div className="flex items-end grid-default-color grid-1">
                    <img
                        src="assets/coding-pov.png"
                        className="absolute scale-[1.75] -right-[5rem] -top-[1rem] md:scale-[3] md:left-50 md:inset-y-10 lg:scale-[2.5]"
                        />
                    <div className="z-10">
                        <p className="headtext">Hi, I'm Vedant Bhole</p>
                        <p className="subtext">Aspiring Software Engineer with a passion for backend development and contemporary technology who is
                            always eager to confront challenges, compose clean code, and contribute to the growth of innovative teams
                            that are shaping the future of technology.</p>
                    </div>
                </div>
                {/*Grid-2*/}
                <div ref={grid2Container} className="grid-default-color grid-2">
                    <div className="flex items-center justify-center w-full h-full">
                        <p className="flex items-end text-5xl text-gray-500">CODE CRASHED</p>
                        <Card style={{rotate:"75deg",top:"30%",left:"20%"}} text="Program" containerRef={grid2Container} />
                        <Card style={{rotate:"-30deg",top:"60%",left:"45%"}} text="Leetcode" containerRef={grid2Container} />
                        <Card style={{rotate:"90deg",bottom:"30%",left:"70%"}} text="Logic" containerRef={grid2Container} />
                        <Card style={{rotate:"-45deg",top:"55%",left:"0%"}} text="Systems" containerRef={grid2Container} />
                        <Card style={{rotate:"20deg",top:"10%",left:"30%"}} text="Code" containerRef={grid2Container} />
                        <Card style={{rotate:"30deg",top:"70%",left:"70%"}} image="assets/logos/python-pink.png" containerRef={grid2Container}/>
                        <Card style={{rotate:"-30deg",top:"30%",left:"10%"}} image="assets/logos/js-pink.png" containerRef={grid2Container}/>
                    </div>
                </div>
                {/*Grid-3*/}
                <div className="grid-black-color grid-3">
                    <div className="z-10 w-[50%]">
                        <p className="headtext">Timezone</p>
                        <p className="subtext">Based in India</p>
                    </div>
                    <figure className="absolute left-[30%] top-[10%]">
                        <Globe/>
                    </figure>
                </div>
                {/*Grid-4*/}
                <div className="grid-special-color grid-4">
                    <div className="flex flex-col items-center justify-center gap-4 size-full">
                        <p className="text-center headtext">Reach out to me via email</p>
                        <CopyEmailButton />
                    </div>
                </div>
                {/*Grid-5*/}
                <div className="grid-default-color grid-5">
                    <div className="z-10 w-[50%]">
                        <p className="headtext">Tech Stack</p>
                        <p className="subtext"><b>Languages:</b> Python, C, SQL, Bash</p>
                        <p className="subtext"><b>Libraries:</b> Pandas, Numpy, Selenium, BeautifulSoup, Scikit-learn</p>
                        <p className="subtext"><b>Web:</b> HTML, CSS, Javascript, Flask, ReactJs, NodeJs, ExpressJs</p>
                        <p className="subtext"><b>Database:</b> MySQL, PostgreSQL, MongoDB</p>
                    </div>
                    <div className="absolute inset-y-0 md:inset-y-9 w-full h-full start[50%] md:scale-125">
                        <Frameworks/>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default About
