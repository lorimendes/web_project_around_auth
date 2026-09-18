import { Link } from "react-router-dom";

function Login() {
  return (
    <>
      <button className="auth__submit-button" type="submit">
        Entrar
      </button>
      <Link className="auth__text" to="/signup">
        Ainda não é membro? Inscreva-se aqui!
      </Link>
    </>
  );
}

export default Login;
