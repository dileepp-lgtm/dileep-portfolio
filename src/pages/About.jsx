import About from '../components/About.jsx';
import Experience from '../components/Experience.jsx';

/* About Dileep: bio + stats and the career timeline. (Expertise, process and
   tools now live on the home page.) */
export default function AboutPage() {
  return (
    <div className="page">
      <About />
      <Experience />
    </div>
  );
}
