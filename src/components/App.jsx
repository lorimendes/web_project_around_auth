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
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "../utils/api.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [popup, setPopup] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  useEffect(() => {
    (async () => {
      await api.getProfile().then((userInfo) => {
        setCurrentUser(userInfo);
      });
    })();
  }, []);

  const handleRegistration = () => {
    setIsLoading(true);
    setPopup({
      children: (
        <InfoTooltip
          statusIcon={errorIcon}
          message={"Ops, algo saiu deu errado! Por favor, tente novamente."}
        />
      ),
    });
    setIsLoading(false);
  };

  const handleLogin = () => {
    setIsLoading(true);
    setPopup({
      children: (
        <InfoTooltip
          statusIcon={successIcon}
          message={"Vitória! Você precisa se registrar."}
        />
      ),
    });
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
    api.getCards().then((cardsFromApi) => {
      setCards(cardsFromApi);
    });
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
                <Header />
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
