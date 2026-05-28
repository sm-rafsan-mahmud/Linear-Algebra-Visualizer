import FeatureCard from '../components/FeatureCard'
import transformImg from '../assets/transform.jpeg'
// import eigenImg from '../assets/eigenImg.png'
import quizImg from '../assets/quizImg.png'
import type { Page } from '../lib/types'

type Props = {
  onNavigate: (page: Page) => void
}

export default function HomePage({ onNavigate }: Props) {

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
          onClick={() => onNavigate('transformations')}
        />


        <FeatureCard
          img={quizImg}
          alt="Quiz"
          name="Quiz"
          description="Practice concepts interactively"
          onClick={() => {}}
        />
      </div>
    </div>
  );
}
