import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import WorkflowSection from './components/WorkflowSection'
import ValidationSection from './components/ValidationSection'
import MultilingualSection from './components/MultilingualSection'
import GISSection from './components/GISSection'
import VerificationSection from './components/VerificationSection'
import SecuritySection from './components/SecuritySection'
import FooterSection from './components/FooterSection'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Hero />
        <ProblemSection />
        <WorkflowSection />
        <ValidationSection />
        <MultilingualSection />
        <GISSection />
        <VerificationSection />
        <SecuritySection />
      </main>

      <FooterSection />
    </div>
  )
}

export default App