function TechCard({ icon, title, description }) {
    return (
        <div className="tech-card">
            <div className="tech-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

export default TechCard;
