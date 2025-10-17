import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SignIn from './pages/SignIn';
import UserList from './pages/UserList';
import ProtectedRouter from './config/ProtectedRouter';
import { ContextProvider } from './context/ContextProvider';

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path="/user/list"
            element={<ProtectedRouter> <UserList /> </ProtectedRouter>}
          />
        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;
