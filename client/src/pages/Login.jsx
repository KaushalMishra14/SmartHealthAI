import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-96"
      >

        <h2 className="text-3xl font-bold mb-6">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4"
          onChange={(e)=>
            setForm({
              ...form,
              email:e.target.value
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-4"
          onChange={(e)=> setForm({...form, password:e.target.value})
          }
        />
        <button className="w-full bg-blue-600 text-white p-3 rounded-lg">
          Login
        </button>

        <p className="text-center mt-4 text-gray-600">Don't have an account?{" "}
           <Link to="/register" className="text-blue-600 font-semibold">
              Register
           </Link>
        </p>

      </form>

    </div>
  );
}

export default Login;