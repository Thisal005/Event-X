import React, { forwardRef } from 'react';

const TicketTemplate = forwardRef(({ event, ticket, user, type = 'preview' }, ref) => {
    // Determine data based on props or defaults for preview
    const eventName = event?.name || 'EVENT NAME';
    const date = event?.date ? new Date(event.date).toLocaleString() : 'DATE AND TIME';
    const location = event?.venue || 'LOCATION';
    // Use ticket name/type as the category displayed on ticket, or event category as fallback
    const category = ticket?.name || ticket?.ticketName || event?.category || 'TICKET CATEGORY';
    const price = ticket?.price ? `$${ticket.price}` : 'PRICE';
    const organizer = event?.organizer || 'EVENT ORGANIZER';

    // For QR Code
    // In preview, we don't show QR. In final, we show QR from backend.
    const showQr = type === 'final' && ticket?.qrCode;

    const styles = {
        page: {
            width: '8.5in',
            height: '2.75in',
            margin: 0,
            padding: 0,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'center', // Center in container if smaller
            alignItems: 'center',
            overflow: 'hidden'
        },
        ticketContainer: {
            width: '8.5in',
            height: '2.75in',
            border: '14px solid #d900d9',
            boxSizing: 'border-box',
            display: 'flex',
            backgroundColor: 'white',
            overflow: 'hidden',
            position: 'relative'
        },
        leftPanel: {
            backgroundColor: '#f2ccf2',
            flex: 7,
            padding: '20px 30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            color: '#660099'
        },
        ticketCategory: {
            position: 'absolute',
            top: '25px',
            right: '30px',
            backgroundColor: 'white',
            color: '#d900d9',
            padding: '8px 15px',
            fontWeight: 600,
            fontSize: '1em',
            letterSpacing: '1px',
            textTransform: 'uppercase'
        },
        eventDetailsH1: {
            margin: 0,
            fontSize: '3.2em',
            fontWeight: 800,
            textTransform: 'uppercase',
            lineHeight: 1
        },
        eventDetailsP: {
            margin: '5px 0 0 0',
            fontSize: '1.3em',
            fontWeight: 500
        },
        ticketFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
        },
        priceBox: {
            backgroundColor: 'white',
            color: '#660099',
            fontSize: '1.8em',
            fontWeight: 900,
            padding: '5px 40px',
            textTransform: 'uppercase'
        },
        organizer: {
            fontStyle: 'italic',
            fontSize: '1.1em'
        },
        rightPanel: {
            flex: 3,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white'
        },
        qrCode: {
            width: '140px',
            height: '140px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '10px'
        },
        websiteUrl: {
            color: '#d900d9',
            fontSize: '1.4em',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.5px'
        }
    };

    return (
        <div ref={ref} style={styles.ticketContainer} className="ticket-template-node">
            <div style={styles.leftPanel}>
                <div style={styles.ticketCategory}>{category}</div>
                <div className="event-details">
                    <h1 style={styles.eventDetailsH1}>{eventName}</h1>
                    <p style={styles.eventDetailsP}>{date}</p>
                    <p style={styles.eventDetailsP}>{location}</p>
                </div>
                <div style={styles.ticketFooter}>
                    <div style={styles.priceBox}>{price}</div>
                    <span style={styles.organizer}>{organizer}</span>
                </div>
            </div>
            <div style={styles.rightPanel}>
                <div style={styles.qrCode} className="qr-code">
                    {showQr ? (
                        <img
                            src={`data:image/png;base64,${ticket.qrCode}`}
                            alt="Ticket QR Code"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        // Placeholder or empty for preview
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                            NO QR
                        </div>
                    )}
                </div>
                <a href="https://www.gogather.com" style={styles.websiteUrl}>Go Gather.com</a>
            </div>
        </div>
    );
});

export default TicketTemplate;
