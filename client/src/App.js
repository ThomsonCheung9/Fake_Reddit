// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import Phreddit from './components/phreddit.js'
import { ModelProvider } from './modelContext.js';

function App() {
  return (
    <ModelProvider>
      <section className="phreddit">
      <Phreddit />
      </section>
    </ModelProvider>
  );
}

export default App;
