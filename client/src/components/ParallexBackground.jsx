import React from 'react'
import {motion, useScroll} from 'motion/react'
const ParallexBackground = () => {
    const {scrollYProgress} = useScroll
    return (
        <section className="absolute inset-0 bg-black/40">
            <div className="relative h-screen overflow-y-hidden">
                <div className="absolute inset-0 w-full h-screen -z-50" style={{
                    backgroundImage: `url(/assets/sky-1.jpg)`,
                    backgroundPosition: 'bottom',
                    backgroundSize: 'cover'}}/>

                <div className="absolute inset-0 -z-40" style={{
                    backgroundImage: `url(/assets/mountain-.png)`,
                    backgroundPosition: 'bottom',
                    backgroundSize: 'cover'}}/>
                <div className="absolute inset-0 -z-30" style={{
                    backgroundImage: `url(/assets/planets.png)`,
                    backgroundPosition: 'bottom',
                    backgroundSize: 'cover'}}/>
                <div className="absolute inset-0 -z-20" style={{
                    backgroundImage: `url(/assets/mountain-.png)`,
                    backgroundPosition: 'bottom',
                    backgroundSize: 'cover'}}/>
                <div className="absolute inset-0 -z-10" style={{
                    backgroundImage: `url(/assets/mountain-.png)`,
                    backgroundPosition: 'bottom',
                    backgroundSize: 'cover'}}/>
            </div>

        </section>
    )
}
export default ParallexBackground
