/** @jsxImportSource @emotion/react */
import './App.css';
import { Routes, Route } from 'react-router-dom';
import FindSheltersPage from './pages/FindSheltersPage';
import HomePage from './pages/homepage';
import NavBar from './pages/homepage/components/NavBar';

function App() {
  return (
    <div>
      <NavBar />
      <main>
        <Routes>
          {/* path="/": 기본 주소일 때 HomePage를 보여줌 */}
          <Route path="/" element={<HomePage />} />

          {/* path="/find-shelters": 주소창에 /find-shelters를 입력하면 FindSheltersPage를 보여줌. */}
          <Route path="/find-shelters" element={<FindSheltersPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
