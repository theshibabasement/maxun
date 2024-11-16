import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/auth';
import { TextField, Button, CircularProgress, Typography, Box, Container } from '@mui/material';
import { useGlobalInfoStore } from "../context/globalInfo";
import { apiUrl } from "../apiConfig";

const Register = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const { notify } = useGlobalInfoStore();
    const { email, password } = form;

    const { state, dispatch } = useContext(AuthContext);
    const { user } = state;
    const navigate = useNavigate();

    useEffect(() => {
        if (user !== null) navigate('/');
    }, [user, navigate]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const submitForm = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${apiUrl}/auth/register`, {
                email,
                password,
            });
            dispatch({
                type: 'LOGIN',
                payload: data,
            });
            notify('success', 'Welcome to Maxun!');
            window.localStorage.setItem('user', JSON.stringify(data));
            navigate('/');
        } catch (err: any) {
            notify('error', err.response.data || 'Registration Failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                
              
             
                height: "calc(100vh - 64px)",
                backgroundColor: '#f5f5f5',
            }}
        >
            
            <Box component="form" onSubmit={submitForm} sx={{ textAlign: 'center',maxWidth: 400, width: '100%', backgroundColor: '#fff', padding: 3, borderRadius: 4,boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom color={'#ff00c3'}>
                Create an account
            </Typography>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    autoComplete="email"
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={handleChange}
                    autoComplete="current-password"
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading || !email || !password}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 2 }} />
                            Loading
                        </>
                    ) : (
                        'Register'
                    )}
                </Button>
                <Typography variant="body2" align="center">
                    Already have an account?{' '}
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        Login
                    </Link>
                </Typography>
            </Box>
            </Box>
       
    );
};

export default Register;
