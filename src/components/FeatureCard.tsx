type FeatureCardProps = {
    img: string,
    alt: string,
    name: string,
    description: string,
    onClick: () => void
};

export default function FeatureCard({
    img,
    alt,
    name,
    description,
    onClick
}: FeatureCardProps) {
    return (
        <div onClick={onClick} style={{ cursor: 'pointer' }}>
            <img src={img} alt={alt} />
            <h2>{name}</h2>
            <p>{description}</p>
        </div>
    );
}