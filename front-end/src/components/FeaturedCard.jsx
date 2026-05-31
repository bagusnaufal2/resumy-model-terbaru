function FeaturedCard({icon, title, description}) {
    return (
        <div className="feature-card">
            <div className="featured-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    )
}

export default FeaturedCard;
