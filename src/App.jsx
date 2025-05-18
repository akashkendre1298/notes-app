import { Routes, Route, HashRouter } from 'react-router-dom';
import Notes from './pages/Notes/Notes';


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Notes />} />
     
      </Routes>
    </HashRouter>
  );
}

export default App;