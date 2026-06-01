import {
    FaChartLine,
    FaFileAlt,
    FaSearchDollar
} from "react-icons/fa";
import { Link } from "react-router-dom";
import FeaturedCard from "./FeaturedCard";

const featureList = [
    {
        icon: <FaSearchDollar />,
        title: "ATS Scoring",
        description:
            "See how closely your CV matches the target job description."
    },
    {
        icon: <FaFileAlt />,
        title: "Skill Gap Matching",
        description:
            "Compare the skills in your CV with the skills in the job description."

    },
    {
        icon: <FaChartLine />,
        title: "Trend Skills",
        description:
            "Open an external reference for IT role and skill trends."
    }
];

function HeroSection() {
    return (
        <section className="hero" id="about">
            <div className="hero-copy">
                <h2>CV review tools.</h2>
                    <h3>Analyze your CV, check skill gaps, and build a simple CV.</h3>
                    <p>
                        Use the analyzer for match results, the roadmap generator for learning steps,
                        and the CV builder to prepare your CV.
                    </p>
                <div className="hero-actions">
                    <a className="primary-button" href="#upload-cv">Analyze your CV</a>
                    <Link className="secondary-button" to="/cv-builder">Build an ATS CV</Link>
                </div>
            </div>

            <div className="content-section" id="featured">
                <div className="section-heading">
                    <span className="section-kicker">Features</span>
                    <h3>Everything you need to improve your resume faster</h3>
                </div>
                <div className="featured-grid">
                    {featureList.map((feature) => (
                        <FeaturedCard
                            key={feature.title}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroSection;
