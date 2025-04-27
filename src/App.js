

import { Route , Routes } from 'react-router-dom';
import './App.css';
import Header from "./pages/header/Header";
import Dashboard from './pages/dashboard/Dashboard';
import Error from './pages/erorr/Error';
import Produit from './pages/produit/Produit';
import Update from './pages/produit/Update';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<Dashboard/>} />
        <Route path='/produit' element={<Produit/>} />
        <Route path='/*' element={<Error/>} />
        <Route path='/produit/:id' element={<Update/>}/>
      </Routes>
    </>
  );
}

export default App;
