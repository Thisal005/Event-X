import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom'; 
import "./vendor.css";

function Vendor() {
    const location = useLocation();
    const { vendorID, vendorName } = location.state || {}; 
    const [totalTickets, setTotalTickets] = useState(0);
    const [maxTicketCapacity, setMaxTicketCapacity] = useState(0);
    const [noOfTickets, setNoOfTickets] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        if (vendorID) {
            getTotalTickets();
            getMaxTicketCapacity();
            const intervalId = setInterval(() => {
                getTotalTickets();
            }, 500);

            return () => clearInterval(intervalId);
        }
    }, [vendorID]);

    const handleInputChange = (e) => {
        setNoOfTickets(e.target.value);
    };

    const getTotalTickets = () => {
        fetch(`http://localhost:8080/tickets/total-tickets`, { method: "GET" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch total tickets");
                }
                return response.json();
            })
            .then((data) => setTotalTickets(data))
            .catch((error) => {
                console.error("Error fetching total tickets:", error);
                setError("Failed to fetch total tickets");
            });
    };

    const getMaxTicketCapacity = () => {
        fetch(`http://localhost:8080/tickets/maxTickets`, { method: "GET" })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch remaining capacity");
                }
                return response.json();
            })
            .then((data) => setMaxTicketCapacity(data))
            .catch((error) => {
                console.error("Error fetching remaining capacity:", error);
                setError("Failed to fetch remaining capacity");
            });
    };

    const addTickets = () => {
        const ticketsToAdd = parseInt(noOfTickets, 10);

        if (isNaN(ticketsToAdd) || ticketsToAdd <= 0) {
            setError("Please enter a valid number of tickets.");
            return;
        }

        if (totalTickets + ticketsToAdd > maxTicketCapacity) {
            setError("Cannot add more tickets. Maximum ticket capacity reached!");
            return;
        }

        fetch(
            `http://localhost:8080/tickets/startVendor?vendorID=${vendorID}&ticketsToAdd=${ticketsToAdd}`,
            { method: "POST" }
        )
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(errorData.message || "Ticket Addition Failed!");
                    });
                }
                return response.text();
            })
            .then((data) => {
                console.log(data);
                setNoOfTickets("");
                getTotalTickets();
                setError(null);
            })
            .catch((error) => {
                console.error("Error adding tickets:", error);
                setError(error.message);
            });
    };

    // Add a redirect or error handling if no vendorID is present
    if (!vendorID) {
        return <div>Please login first</div>;
    }

    return (
        <div className="container">
            <h1>Hello {vendorName || 'Vendor'}</h1>
            <div className="ticket-info">
                <h2>Total Tickets in System</h2>
                <p>{totalTickets}</p>
            </div>
            <div className="ticket-info">
                <h2>Maximum Ticket Capacity</h2>
                <p>{maxTicketCapacity}</p>
            </div>
            <div>
                <input
                    type="number"
                    value={noOfTickets}
                    onChange={handleInputChange}
                    placeholder="Number of Tickets to ADD"
                />
                {error && <p className="error-message">{error}</p>}
                <button onClick={addTickets}>ADD</button>
            </div>
        </div>
    );
}

export default Vendor;