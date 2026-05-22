import {
    FaChartLine,
    FaFileAlt,
    FaSearchDollar
} from "react-icons/fa";
import FeaturedCard from "./FeaturedCard";

const featureList = [
    {
        icon: <FaSearchDollar />,
        title: "ATS Scoring",
        description:
            "Measure how well your resume matches ATS filters before you apply."
    },
    {
        icon: <FaFileAlt />,
        title: "Skill Gap Matching",
        description:
            "Spot missing keywords and important skills recruiters expect to see."

    },
    {
        icon: <FaChartLine />,
        title: "Trend Skills",
        description:
            "Follow job-market trends so your resume stays relevant and up to date."
    }
];

function HeroSection() {
    return (
        <section className="hero" id="about">
            <div className="hero-copy">
                <span className="badge">
                    AI ATS Matcher
                </span>
                <h2>Beat the ATS.</h2>
                <h3>Land the interview with a resume that actually matches.</h3>
                <p>
                    Upload your CV, get an instant match score, uncover missing skills,
                    and learn what to improve before sending your next application.
                </p>
                <div className="hero-actions">
                    <a className="primary-button" href="#upload-cv">Analyze your CV</a>
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
