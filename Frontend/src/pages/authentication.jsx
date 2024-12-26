import * as React from "react";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Paper,
    Box,
    Grid,
    Snackbar,
    Typography,
    createTheme,
    ThemeProvider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { AuthContext } from "../contexts/AuthContext";

const defaultTheme = createTheme();

export default function Authentication() {
    const [userName, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(userName, password);
                setMessage("Login successful!");
                setOpen(true);
                setError("");
            } else if (formState === 1) {
                const result = await handleRegister(name, userName, password);
                setMessage(result || "Registration successful!");
                setOpen(true);
                setError("");
                setFormState(0);
                setName("");
                setUsername("");
                setPassword("");
            }
        } catch (err) {
            setError(err.message || "An error occurred");
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid
                container
                component="main"
                sx={{ height: "100vh", justifyContent: "center", alignItems: "center" }}
            >
                <CssBaseline />
                <Grid
                    item
                    xs={12}
                    component={Paper}
                    elevation={6}
                    square
                    sx={{ padding: 4, display: "flex", justifyContent: "center" }}
                >
                    <Box sx={{ maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Box sx={{ display: "flex", gap: 6, mb: 2 }}>
                            <Button variant={formState === 0 ? "contained" : "outlined"} onClick={() => setFormState(0)}>
                                Sign In
                            </Button>
                            <Button variant={formState === 1 ? "contained" : "outlined"} onClick={() => setFormState(1)}>
                                Sign Up
                            </Button>
                        </Box>
                        <Box component="form" noValidate>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            )}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Username"
                                value={userName}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={error || message}
            />
        </ThemeProvider>
    );
}
