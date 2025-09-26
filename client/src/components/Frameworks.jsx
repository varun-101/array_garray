import { OrbitingCircles } from '../components/OrbitingCircles'

export function Frameworks() {
    const skills = [
        "css3",
        "git",
        "github",
        "html5",
        "javascript",
        "react",
        "python",
        "nodejs",
        "expressjs",
        "mongodb",
        "pandas",
        "scikit-learn",
        "numpy",
        "postman",
        "sqlite",
        "tailwindcss",
        "vitejs",
    ];
    return (
        <div className="relative flex h-[450px] left-[40%] w-full flex-col items-center justify-center">
            <OrbitingCircles iconSize={40}>
                {skills.map((skill, index) => (<Icon key={index} src={`assets/logos/${skill}.svg`} />))}
            </OrbitingCircles>
            <OrbitingCircles iconSize={25} radius={100} reverse speed={2}>
                {skills.reverse().map((skill, index) => (<Icon key={index} src={`assets/logos/${skill}.svg`} />))}
            </OrbitingCircles>
        </div>
    );
}

const Icon=({src}) => (
    <img src={src} className="rounded-sm hover:scale-110 duration-200" />
)
