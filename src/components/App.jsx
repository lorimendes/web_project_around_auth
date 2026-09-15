import logo from "../images/Vector.png";
import Header from "./Header/Header.jsx";
import Main from "./Main/Main.jsx";
import Footer from "./Footer/Footer.jsx";
import ProtectedRoute from "./ProtectedRoute";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
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
        console.log(userInfo.avatar);
      });
    })();
  }, []);

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
              <Register />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/signip"
          element={
            <ProtectedRoute anonymous>
              <Login />
            </ProtectedRoute>
          }
        ></Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="page">
                <Header src={logo} />
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
      </Routes>
    </CurrentUserContext.Provider>
  );
}

export default App;
