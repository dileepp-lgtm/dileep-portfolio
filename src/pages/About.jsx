import About from '../components/About.jsx';
import Experience from '../components/Experience.jsx';
import Expertise from '../components/Expertise.jsx';
import Process from '../components/Process.jsx';
import Tools from '../components/Tools.jsx';

/* Everything about Dileep: bio + stats, career timeline, expertise,
   working process, and the toolset. */
export default function AboutPage() {
  return (
    <div className="page">
      <About />
      <Experience />
      <Expertise />
      <Process />
      <Tools />
    </div>
  );
}
