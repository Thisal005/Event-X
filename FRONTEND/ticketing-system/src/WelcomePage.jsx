import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./WelcomePage.css";

function WelcomePage() {
    const [totalTickets, setTotalTickets] = useState(0);
    const [availableTickets, setAvailableTickets] = useState(0);
    const [remainingCapacity, setRemainingCapacity] = useState(0);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTicketInformation();
        const intervalId = setInterval(() => {
            fetchTicketInformation();
        }, 500);
        return () => clearInterval(intervalId);
    }, []);

    const fetchTicketInformation = async () => {
        try {
            const totalResponse = await fetch('http://localhost:8080/tickets/total-tickets');
            const totalTickets = await totalResponse.json();
            setTotalTickets(totalTickets);

            const salesResponse = await fetch('http://localhost:8080/tickets/total-sales');
            const sales = await salesResponse.json();
            setAvailableTickets(sales);

            const capacityResponse = await fetch('http://localhost:8080/tickets/remaining-capacity');
            const capacity = await capacityResponse.json();
            setRemainingCapacity(capacity);
        } catch (error) {
            console.error('Error fetching ticket information:', error);
            setError('Failed to fetch ticket information');
        }
    };

    const vendorLogin = () => {
        navigate('/vendorlogin');
    };

    const customerLogin = () => {
        navigate('/customerlogin');
    };

    const handleStop = () => {
        fetch('http://localhost:8080/system/stop', {
            method: 'POST'
        })
        .then(response => response.text())
        .then(data => {
            alert("Ticket pool stopped");
            navigate('/');
        })
        .catch(error => {
            console.error('Stop error:', error);
            alert('Failed to stop system');
        });
    };

    return (
        <div className="welcome-page">
            <h1>Welcome to the Ticketing System</h1>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <div className="ticket-info">
                <h2>Ticket Information</h2>
                <p>Total Number of Tickets in System: {totalTickets}</p>
                <p>Total Ticket Sales: {availableTickets}</p>
                <p>Remaining Tickets Capacity: {remainingCapacity}</p>
            </div>
            <div className="login-section">
                <h2>Login</h2>
                <button onClick={vendorLogin}>Vendor</button>
                <button onClick={customerLogin}>Customer</button>
            </div>
            <div>
                <button onClick={handleStop}>Stop</button>
            </div>
        </div>
    );
}

export default WelcomePage;