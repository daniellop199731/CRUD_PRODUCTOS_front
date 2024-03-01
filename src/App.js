import { BrowserRouter, Routes, Route } from "react-router-dom";
import MostrarProductos from './componentes/MostrarProductos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MostrarProductos></MostrarProductos>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
