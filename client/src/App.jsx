import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Calls from './pages/Calls';
import Status from './pages/Status';
import Settings from './pages/Settings';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Chat />} />
              <Route path="/calls" element={<Calls />} />
              <Route path="/status" element={<Status />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
