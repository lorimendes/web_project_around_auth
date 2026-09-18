import { Link } from "react-router-dom";

function Register() {
  return (
    <>
      <button className="auth__submit-button" type="submit">
        Inscrever-se
      </button>
      <Link className="auth__text" to="/signin">
        Já é um membro? Faça o login aqui!
      </Link>
    </>
  );
}

export default Register;
