import FeatureCard from '../components/FeatureCard'
import transformImg from '../assets/transform.jpeg'
// import eigenImg from '../assets/eigenImg.png'
import quizImg from '../assets/quizImg.png'
<<<<<<< HEAD
import { Box } from '../components/Box'
export default function HomePage() {
=======
import type { Page } from '../lib/types'

type Props = {
  onNavigate: (page: Page) => void
}

export default function HomePage({ onNavigate }: Props) {

>>>>>>> f950c9d4153520ca918e0d69f5b0536ec80bfd52
  return (
    <div>
      <div className="header">
        <h1>Linear Algebra Visualizer</h1>
      </div>

      <div className="card-container">
        {/* <FeatureCard
          img={transformImg}
          alt="Transformation"
          name="Transformations"
          description="Visualize transformations"
<<<<<<< HEAD
        /> */}
=======
          onClick={() => onNavigate('transformations')}
        />
>>>>>>> f950c9d4153520ca918e0d69f5b0536ec80bfd52


        <FeatureCard
          img={quizImg}
          alt="Quiz"
          name="Quiz"
          description="Practice concepts interactively"
          onClick={() => {}}
        />

        <FeatureCard
          img={transformImg}
          alt="Transformation"
          name="Transformations"
          description="Visualize transformations"
        />
      </div>
    </div>
  );
}
