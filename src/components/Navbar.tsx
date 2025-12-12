import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>📚 Sistema de Biblioteca</span>
      </div>
      <div className="navbar-menu">
        <Link 
          to="/" 
          className={`navbar-item ${isActive('/') ? 'active' : ''}`}
        >
          Libros
        </Link>
        <Link 
          to="/loans" 
          className={`navbar-item ${isActive('/loans') ? 'active' : ''}`}
        >
          Préstamos
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;