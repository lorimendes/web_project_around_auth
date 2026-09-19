import { useState } from "react";
import logo from "../../images/Vector.png";

function Header({ email }) {
  const [isOpened, setIsOpened] = useState(false);

  const handleMenuButton = () => {
    setIsOpened(!isOpened);
  };

  return (
    <header className="header">
      <div className="header__container">
        <div
          className={`header__menu ${isOpened ? "header__menu_opened" : ""}`}
        >
          <p className="header__text">{email}</p>
          <p className="header__text header__logout">Sair</p>
          <div className="header__line"></div>
        </div>
        <div className="header__content">
          <img className="header__logo" src={logo} alt="Logo Around The U.S." />
          <div className="header__info">
            <p className="header__text header__email">{email}</p>
            <p className="header__text header__logout">Sair</p>
            <button
              className={`header__menu-button ${isOpened ? "header__menu-button_clicked" : ""}`}
              type="button"
              onClick={handleMenuButton}
            ></button>
          </div>
        </div>
        <div className="header__line"></div>
      </div>
    </header>
  );
}

export default Header;
