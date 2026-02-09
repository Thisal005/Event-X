import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './Login.css';

function VendorLogin() {
    const [id, setId] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = () => {
        setError(null);
        if (!id) {
            setError("Please Enter ID");
            return;
        }

        fetch(`http://localhost:8080/accounts/load?id=${id}&type=vendor`, { method: 'GET' })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Login failed');
                }
            })
            .then(async data => {
                console.log('Login successful:', data);
                if (data === true) {
                    const response = await fetch(`http://localhost:8080/accounts/vendor?id=${id}`);
                    return await response.json();
                } else {
                    throw new Error('Login failed - Invalid ID - Account not found');
                }
            })
            .then(vendorDetails => {
                alert('Login successful');
                navigate('/vendor', { 
                    state: { 
                        vendorID: id, 
                    } 
                });
            })
            .catch(error => {
                console.error('Login error:', error);
                setError(error.message);
            });
    }

    const handleInputChange = (e) => {
        setId(e.target.value);
    }

    return (
        <div className="container">
            <h1>Vendor Login</h1>
            <div>
                UserID:
                <input type="text" value={id} onChange={handleInputChange} placeholder="Enter ID" />
                <button onClick={handleLogin}>Login</button>
            </div>
            {error && <p>{error}</p>}
            <div>
                Not have account?
                <a href="/createaccount">Create Account</a>
            </div>
        </div>
    );
}

export default VendorLogin;