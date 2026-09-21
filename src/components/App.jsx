import Auth from "./Auth/Auth.jsx";
import Login from "./Auth/components/Login.jsx";
import Register from "./Auth/components/Register.jsx";
import InfoTooltip from "./Auth/components/InfoTooltip.jsx";
import successIcon from "../images/success-status.png";
import errorIcon from "../images/error-status.png";
import Header from "./Header/Header.jsx";
import Main from "./Main/Main.jsx";
import Footer from "./Footer/Footer.jsx";
import ProtectedRoute from "./ProtectedRoute";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { register, authorize, getUserData } from "../utils/auth.js";
import { api } from "../utils/api.js";
import { setToken, getToken } from "../utils/token";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [popup, setPopup] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const navigate = useNavigate();

  const triggerPopup = (status) => {
    let messageInfoTooltip = "";
    if (status === 200) {
      messageInfoTooltip = "Deu tudo certo! Você já pode fazer o login.";
    } else if (status === 400) {
      messageInfoTooltip = "Ops, um dos campos foi preenchido incorretamente.";
    } else if (status === 401) {
      messageInfoTooltip = "E-mail não encontrado.";
    } else {
      messageInfoTooltip =
        "Ops, algo saiu deu errado! Por favor, tente novamente.";
    }

    setPopup({
      children: (
        <InfoTooltip
          statusIcon={status === 200 ? successIcon : errorIcon}
          message={messageInfoTooltip}
        />
      ),
    });
  };

  const handleRegistration = async ({ password, email }) => {
    setIsLoading(true);
    try {
      const data = await register({ password, email });
      triggerPopup(200);
      navigate("/");
    } catch (error) {
      triggerPopup(error.status);
    }
    setIsLoading(false);
  };

  const handleLogin = async ({ password, email }) => {
    setIsLoading(true);
    try {
      const data = await authorize({ password, email });
      const userData = await getUserData(data.token);
      if (userData) {
        setToken(data.token);
        setEmail(userData.data.email);
        setIsLoggedIn(true);
        const redirectPath = location.state?.from?.pathname || "/";
        navigate(redirectPath);
      }
    } catch (error) {
      triggerPopup(error.status);
    }
    setIsLoading(false);
  };

  const handleUpdateUser = (userInfo) => {
    setIsLoading(true);
    (async () => {
      await api
        .updateProfile(userInfo)
        .then((newUserInfo) => {
          setCurrentUser(newUserInfo);
          setPopup(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    })();
  };

  const handleUpdateAvatar = (avatar) => {
    setIsLoading(true);
    (async () => {
      await api
        .updateAvatar(avatar)
        .then((newUserInfo) => {
          setCurrentUser(newUserInfo);
          setPopup(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    })();
  };

  async function handleCardLike(cardToUpdate) {
    try {
      const updatedCard = await api.updateLike(cardToUpdate);
      setCards((state) =>
        state.map((currentCard) =>
          currentCard._id == cardToUpdate._id ? updatedCard : currentCard,
        ),
      );
    } catch (error) {
      console.log(error);
    }
  }

  const handleCardDeleteClick = (card) => {
    setCardToDelete(card);
  };

  const handleCardDeleteConfirm = () => {
    if (!cardToDelete) return;
    setIsLoading(true);
    (async () => {
      await api
        .deleteCard(cardToDelete)
        .then(() => {
          setCards(
            cards.filter((currentCard) => currentCard._id !== cardToDelete._id),
          );
          setPopup(null);
        })
        .finally(() => {
          setIsLoading(false);
          setCardToDelete(null);
        });
    })();
  };

  const handleAddCardSubmit = (newCard) => {
    setIsLoading(true);
    (async () => {
      await api
        .postCard(newCard)
        .then((newCard) => {
          setPopup(null);
          setCards([newCard, ...cards]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    })();
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }
    (async () => {
      try {
        const userData = await getUserData(token);
        setIsLoggedIn(true);
        setEmail(userData.data.email);

        const userInfo = await api.getProfile();
        setCurrentUser(userInfo);

        const cardsFromApi = await api.getCards();
        setCards(cardsFromApi);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        handleUpdateUser,
        handleUpdateAvatar,
        handleAddCardSubmit,
        handleCardDeleteConfirm,
        isLoading,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      <Routes>
        <Route
          path="/signup"
          element={
            <ProtectedRoute anonymous>
              <Auth
                title={"Inscrever-se"}
                onSubmit={handleRegistration}
                popup={popup}
                onClosePopup={() => setPopup(null)}
              >
                <Register />
              </Auth>
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/signin"
          element={
            <ProtectedRoute anonymous>
              <Auth
                title={"Entrar"}
                onSubmit={handleLogin}
                popup={popup}
                onClosePopup={() => setPopup(null)}
              >
                <Login />
              </Auth>
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="page">
                <Header email={email} />
                <Main
                  onOpenPopup={setPopup}
                  onClosePopup={() => setPopup(null)}
                  popup={popup}
                  cards={cards}
                  onCardLike={handleCardLike}
                  onClickDeleteCard={handleCardDeleteClick}
                />
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
      </Routes>
    </CurrentUserContext.Provider>
  );
}

export default App;
