/** @jsxImportSource @emotion/react */
import './App.css';
import HomePage from './pages/homepage';
import NavBar from './pages/homepage/components/NavBar';

function App() {
  return (
    <div>
      <NavBar />
      <main>
        <HomePage />
      </main>
    </div>
  );
}

export default App;
