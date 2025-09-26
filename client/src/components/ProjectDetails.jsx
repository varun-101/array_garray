import React from 'react'
import {motion} from "motion/react";

const ProjectDetails = ({
                            title,
                            description,
                            subDescription,
                            image,
                            href,
                            tags,
                        closeModal}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full overflow-hidden backdrop-blur-sm ">
            <motion.div className="relative max-w-2xl border shadow-sm rounded-2xl bg-gradient-to-l from-midnight to-navy border-white/10"
                        initial={{ opacity: 0,scale:0.5 }}
                        animate={{ opacity: 1, scale: 1 }}>
                <button onClick={closeModal} className="absolute p-2 rounded-sm top-5 right-5 bg-midnight hover:bg-gray-500 cursor-pointer">
                    <img src="assets/close.svg" className="h-6 w-6" />
                </button>
                <img src={import.meta.env.BASE_URL + image.replace(/^\//, "")} alt={title} className="w-full rounded-t-2xl" />
                <div className="p-5">
                    <h5 className="mb-2 text-2xl font-bold text-white">{title}</h5>
                    <p className="mb-3 font-normal text-neutral-400">{description}</p>
                    {subDescription.map((subDesc, index) => (
                        <p className="mb-3 font-normal text-neutral-400">{subDesc}</p>
                    ))}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-3">
                            {tags.map((tag, index) => (
                                <img key={tag.id} src={import.meta.env.BASE_URL + tag.path.replace(/^\//, "")} alt={tag.image} className="rounded-lg size-10 hover-animation" />
                            ))}
                        </div>
                        <a className="inline-flex items-center gap-1 font-medium cursor-pointer hover-animation" href={href}>View repo <img src="assets/arrow-up.svg" className="size-4"/></a>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
export default ProjectDetails
