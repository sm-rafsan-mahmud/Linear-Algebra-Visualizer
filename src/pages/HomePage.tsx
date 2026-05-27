
import FeatureCard from '../components/FeatureCard'
import transformImg from '../assets/transform.jpeg'
import eigenImg from '../assets/eigenImg.png'
import quizImg from '../assets/quizImg.png'

export default function HomePage() {
  return (
    <div>

      <div className="header">
        <h1>Linear Algebra Visualizer</h1>
      </div>

      <div className="card-container">
        <FeatureCard
          img={transformImg}
          alt="Transformation"
          name="Transformations"
          description="Visualize transformations"
        />


        <FeatureCard
          img={quizImg}
          alt="Quiz"
          name="Quiz"
          description="Practice concepts interactively"
        />
      </div>

    </div>
  );
}
