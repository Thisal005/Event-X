Here's a simplified version for your README file:

------------------------------------------------------------------------------------------------------

# Real-Time Ticket Booking System (CLI - Java)

## Introduction
The Real-Time Ticket Booking System is a multi-threaded Java application simulating a ticket booking process. Vendors add tickets to a pool while customers purchase them, ensuring controlled ticket management and system capacity.

-------------------------------------------------------------------------------------------------------

## Prerequisites
- **Java**: JDK 11 or higher.
- **IDE**: IntelliJ IDEA or Eclipse (recommended for development).
- **Build Tool**: Maven or Gradle.

-------------------------------------------------------------------------------------------------------

## How to Run
1. **Start the Application**  
   Run the `Main` class 

2. **Configuration**  
   Follow the prompts to input:  
   - **Total Tickets**: Total tickets available for sale.  
   - **Max System Capacity**: Maximum tickets stored at a time.  
   - **Customer Retrieval Rate**: Interval for customer ticket purchases (seconds).  
   - **Vendor Release Rate**: Interval for vendor ticket additions (seconds).  

   The system validates inputs and saves configurations in a JSON file.

3. **Operation**  
   - Vendors add tickets, and customers purchase them in real-time.  
   - The process ends when all tickets are sold.

--------------------------------------------------------------------------------------------------------

## Features
- Multi-threaded design for real-time ticket booking.
- Input validation for safe and consistent operations.
- User-friendly CLI for setup and operations.

--------------------------------------------------------------------------------------------------------

