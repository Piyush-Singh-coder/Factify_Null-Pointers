import { Route, Routes } from "react-router-dom";
import Main from "./components/Main";
import LandingPage from "./pages/LandingPage";
import { useThemeStore } from "./store/useThemeStore";
import { SignIn } from "@clerk/clerk-react";


// --- Constants ---
export const API_BASE_URL = "http://localhost:8000";

export default function App() {

    const {theme} = useThemeStore();
    return (
        <div data-theme = {theme}>
            <Routes>
            <Route path='/' element={<LandingPage/>} />
            <Route path='/ai' element={<Main />}></Route> 
            <Route path="/sign-in" element={<SignIn />} /> 
            </Routes>
            
        </div>
    );
}
