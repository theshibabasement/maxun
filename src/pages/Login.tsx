import axios from "axios";
import { useState, useContext, useEffect, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/auth";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useGlobalInfoStore } from "../context/globalInfo";
import { apiUrl } from "../apiConfig";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { notify } = useGlobalInfoStore();
  const { email, password } = form;

  const { state, dispatch } = useContext(AuthContext);
  const { user } = state;

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submitForm = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password,
      });
      dispatch({ type: "LOGIN", payload: data });
      notify("success", "Welcome to Maxun!");
      window.localStorage.setItem("user", JSON.stringify(data));
      navigate("/");
    } catch (err) {
      notify("error", "Login Failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ height: "calc(100vh - 60px)" }}>
      {/* Left Side: Login Form */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff", // Light background color
        }}
      >
        <Box
          component="form"
          onSubmit={submitForm}
          sx={{
            textAlign: "center",
            maxWidth: 400,
            width: "100%",
            backgroundColor: "#f9f9f9",
            padding: 4,
            borderRadius: 4,
            boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
            border: "2px solid #ff00c3",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h4" gutterBottom color="#ff00c3">
            Welcome Back!
          </Typography>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={email}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: email ? "#ffe6f9" : "#ffffff",
                "& fieldset": {
                  borderColor: "#ff33cc",
                },
                "&:hover fieldset": {
                  borderColor: "#ff33cc",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ff33cc",
                },
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px #ffe6f9 inset",
                WebkitTextFillColor: "#000",
              },
              "& .MuiInputLabel-root": {
                color: email ? "#ff33cc" : "#000000",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#ff33cc",
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: password ? "#ffe6f9" : "#ffffff",
                "& fieldset": {
                  borderColor: "#ff33cc",
                },
                "&:hover fieldset": {
                  borderColor: "#ff33cc",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ff33cc",
                },
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px #ffe6f9 inset",
                WebkitTextFillColor: "#000",
              },
              "& .MuiInputLabel-root": {
                color: password ? "#ff33cc" : "#000000",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#ff33cc",
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 2 }}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 2 }} />
                Loading
              </>
            ) : (
              "Login"
            )}
          </Button>

          <Typography variant="body2" align="center">
            Don’t have an account?{" "}
            <Link to="/register" style={{ textDecoration: "none", color: "#ff33cc" }}>
              Register
            </Link>
          </Typography>
        </Box>
      </Grid>

      {/* Right Side: Aesthetic Info Section */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5", // Subtle light background
          padding: 4,
          textAlign: "center",
        }}
      >
        <Box>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#ff33cc",
              textShadow: "1px 1px 5px rgba(255, 0, 195, 0.2)",
            }}
          >
            Welcome to Maxun
          </Typography>
          <Typography variant="h6" sx={{ color: "#555" }}>
            Maxun is a powerful visual website scraper that makes extracting data from any website as easy as a few clicks. 
            No more complex code or time-consuming processes—Maxun does the heavy lifting for you. Start your data extraction journey with us!
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;
