// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import AppPhreddit from './components/phreddit.js'

function App() {
  return (
      <section className="phreddit">
      <AppPhreddit />
      </section>
  );
}

export default App;
